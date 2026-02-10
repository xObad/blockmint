import { useQuery } from "@tanstack/react-query";

export interface StripeConfig {
  enabled: boolean;
  publishableKey: string | null;
  currency: string;
  minAmount: number;
  maxAmount: number;
  mode: "test" | "live";
}

/**
 * Hook to check if Stripe is enabled and get the publishable key
 */
export function useStripeConfig() {
  return useQuery<StripeConfig>({
    queryKey: ["/api/stripe/config"],
    staleTime: 60_000, // cache for 1 minute
    refetchOnWindowFocus: false,
  });
}

/**
 * Create a payment intent for a product purchase
 */
export async function createPaymentIntent(params: {
  userId: string;
  amount: number;
  productType: string;
  productId?: string;
  productName: string;
  metadata?: Record<string, any>;
}): Promise<{
  clientSecret: string;
  paymentIntentId: string;
  paymentId: string;
}> {
  const res = await fetch("/api/stripe/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create payment");
  }

  return res.json();
}

/**
 * Get user payment history
 */
export async function getUserPayments(userId: string) {
  const res = await fetch(`/api/stripe/payments/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch payments");
  return res.json();
}
