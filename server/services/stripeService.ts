import Stripe from "stripe";
import { db } from "../db";
import * as schema from "../../shared/schema";
import { eq } from "drizzle-orm";

// Cached Stripe instance
let stripeInstance: Stripe | null = null;
let cachedSettings: schema.StripeSettings | null = null;
let settingsLastFetched = 0;
const CACHE_TTL = 30_000; // 30 seconds

/**
 * Fetch Stripe settings from the database
 */
export async function getStripeSettings(): Promise<schema.StripeSettings | null> {
  const now = Date.now();
  if (cachedSettings && now - settingsLastFetched < CACHE_TTL) {
    return cachedSettings;
  }

  const rows = await db.select().from(schema.stripeSettings).limit(1);
  cachedSettings = rows[0] ?? null;
  settingsLastFetched = now;
  return cachedSettings;
}

/**
 * Invalidate the Stripe settings cache (call after admin updates settings)
 */
export function invalidateStripeCache() {
  cachedSettings = null;
  stripeInstance = null;
  settingsLastFetched = 0;
}

/**
 * Get a configured Stripe instance based on current admin settings
 */
export async function getStripe(): Promise<Stripe | null> {
  if (stripeInstance) return stripeInstance;

  const settings = await getStripeSettings();
  if (!settings || !settings.isEnabled) return null;

  const secretKey =
    settings.mode === "live" ? settings.liveSecretKey : settings.testSecretKey;

  if (!secretKey) return null;

  stripeInstance = new Stripe(secretKey, {
    apiVersion: "2025-01-27.acacia" as any,
  });

  return stripeInstance;
}

/**
 * Get the publishable key for the frontend
 */
export async function getPublishableKey(): Promise<string | null> {
  const settings = await getStripeSettings();
  if (!settings || !settings.isEnabled) return null;

  return settings.mode === "live"
    ? settings.livePublishableKey
    : settings.testPublishableKey;
}

/**
 * Get the webhook secret for verifying Stripe webhook signatures
 */
export async function getWebhookSecret(): Promise<string | null> {
  const settings = await getStripeSettings();
  if (!settings) return null;

  return settings.mode === "live"
    ? settings.liveWebhookSecret
    : settings.testWebhookSecret;
}

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string | null> {
  const stripe = await getStripe();
  if (!stripe) return null;

  // Check if customer already exists
  const existing = await db
    .select()
    .from(schema.stripeCustomers)
    .where(eq(schema.stripeCustomers.userId, userId))
    .limit(1);

  if (existing[0]) {
    return existing[0].stripeCustomerId;
  }

  // Create a new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { userId },
  });

  await db.insert(schema.stripeCustomers).values({
    userId,
    stripeCustomerId: customer.id,
    email,
    name,
  });

  return customer.id;
}

/**
 * Create a payment intent for a product purchase
 */
export async function createPaymentIntent(params: {
  userId: string;
  email: string;
  displayName?: string;
  amount: number; // in dollars
  productType: string;
  productId?: string;
  productName: string;
  metadata?: Record<string, any>;
}): Promise<{
  clientSecret: string;
  paymentIntentId: string;
  paymentId: string;
} | null> {
  const stripe = await getStripe();
  const settings = await getStripeSettings();
  if (!stripe || !settings) return null;

  // Validate amount
  if (params.amount < settings.minPaymentAmount) {
    throw new Error(
      `Minimum payment amount is $${settings.minPaymentAmount}`
    );
  }
  if (params.amount > settings.maxPaymentAmount) {
    throw new Error(
      `Maximum payment amount is $${settings.maxPaymentAmount}`
    );
  }

  // Get or create customer
  const customerId = await getOrCreateCustomer(
    params.userId,
    params.email,
    params.displayName
  );

  // Convert dollars to cents
  const amountInCents = Math.round(params.amount * 100);

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: settings.currency || "usd",
    customer: customerId || undefined,
    metadata: {
      userId: params.userId,
      productType: params.productType,
      productId: params.productId || "",
      productName: params.productName,
      ...params.metadata,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // Create a local payment record
  const [payment] = await db
    .insert(schema.stripePayments)
    .values({
      userId: params.userId,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: customerId || undefined,
      amount: params.amount,
      currency: settings.currency || "usd",
      status: "pending",
      productType: params.productType,
      productId: params.productId,
      productName: params.productName,
      metadata: params.metadata,
    })
    .returning();

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
    paymentId: payment.id,
  };
}

/**
 * Handle successful payment - credit user account
 */
export async function handlePaymentSuccess(
  paymentIntentId: string,
  receiptUrl?: string
): Promise<void> {
  // Get payment record
  const [payment] = await db
    .select()
    .from(schema.stripePayments)
    .where(
      eq(schema.stripePayments.stripePaymentIntentId, paymentIntentId)
    )
    .limit(1);

  if (!payment) {
    console.error(`No payment record found for intent ${paymentIntentId}`);
    return;
  }

  if (payment.status === "succeeded") {
    console.log(`Payment ${paymentIntentId} already processed`);
    return;
  }

  // Update payment status
  await db
    .update(schema.stripePayments)
    .set({
      status: "succeeded",
      receiptUrl,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.stripePayments.id, payment.id));

  // Credit user's USDT wallet with the dollar amount
  const [wallet] = await db
    .select()
    .from(schema.wallets)
    .where(eq(schema.wallets.userId, payment.userId))
    .limit(1);

  if (wallet) {
    // Find user's USDT wallet
    const [usdtWallet] = await db
      .select()
      .from(schema.wallets)
      .where(eq(schema.wallets.userId, payment.userId))
      .then((wallets) => wallets.filter((w) => w.symbol === "USDT"));

    if (usdtWallet) {
      await db
        .update(schema.wallets)
        .set({ balance: usdtWallet.balance + payment.amount })
        .where(eq(schema.wallets.id, usdtWallet.id));
    }
  }

  // Create a transaction record
  await db.insert(schema.transactions).values({
    userId: payment.userId,
    type: "deposit",
    amount: payment.amount,
    currency: "USDT",
    status: "completed",
    note: `Stripe payment: ${payment.productName}`,
  });

  // Create an order if product-specific
  if (payment.productType !== "wallet_deposit") {
    await db.insert(schema.orders).values({
      userId: payment.userId,
      type: payment.productType,
      productId: payment.productId || undefined,
      productName: payment.productName || "Stripe Purchase",
      amount: payment.amount,
      currency: "USDT",
      status: "completed",
      paymentMethod: "stripe",
      metadata: {
        stripePaymentIntentId: paymentIntentId,
        ...(payment.metadata as any),
      },
      balanceDeducted: false,
    });
  }

  console.log(
    `Payment ${paymentIntentId} succeeded. Credited $${payment.amount} to user ${payment.userId}`
  );
}

/**
 * Handle payment failure
 */
export async function handlePaymentFailure(
  paymentIntentId: string,
  failureReason?: string
): Promise<void> {
  await db
    .update(schema.stripePayments)
    .set({
      status: "failed",
      failureReason,
      updatedAt: new Date(),
    })
    .where(
      eq(schema.stripePayments.stripePaymentIntentId, paymentIntentId)
    );
}

/**
 * Refund a payment
 */
export async function refundPayment(
  paymentId: string,
  amount?: number // partial refund in dollars, or full if omitted
): Promise<boolean> {
  const stripe = await getStripe();
  if (!stripe) return false;

  const [payment] = await db
    .select()
    .from(schema.stripePayments)
    .where(eq(schema.stripePayments.id, paymentId))
    .limit(1);

  if (!payment || !payment.stripePaymentIntentId) return false;

  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: payment.stripePaymentIntentId,
  };

  if (amount) {
    refundParams.amount = Math.round(amount * 100);
  }

  await stripe.refunds.create(refundParams);

  const refundedAmount = amount || payment.amount;
  await db
    .update(schema.stripePayments)
    .set({
      status: "refunded",
      refundedAmount,
      refundedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.stripePayments.id, paymentId));

  return true;
}

/**
 * Get all payments for a user
 */
export async function getUserPayments(userId: string) {
  return db
    .select()
    .from(schema.stripePayments)
    .where(eq(schema.stripePayments.userId, userId))
    .orderBy(schema.stripePayments.createdAt);
}

/**
 * Get all payments (admin)
 */
export async function getAllPayments() {
  return db
    .select()
    .from(schema.stripePayments)
    .orderBy(schema.stripePayments.createdAt);
}
