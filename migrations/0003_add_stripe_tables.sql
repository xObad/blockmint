CREATE TABLE IF NOT EXISTS "stripe_settings" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "is_enabled" boolean NOT NULL DEFAULT false,
  "mode" text NOT NULL DEFAULT 'test',
  "test_publishable_key" text,
  "test_secret_key" text,
  "test_webhook_secret" text,
  "live_publishable_key" text,
  "live_secret_key" text,
  "live_webhook_secret" text,
  "currency" text NOT NULL DEFAULT 'usd',
  "allowed_payment_methods" jsonb DEFAULT '["card"]',
  "min_payment_amount" real NOT NULL DEFAULT 5,
  "max_payment_amount" real NOT NULL DEFAULT 10000,
  "webhook_url" text,
  "updated_at" timestamp DEFAULT now(),
  "updated_by" varchar
);

CREATE TABLE IF NOT EXISTS "stripe_customers" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" varchar NOT NULL REFERENCES "users"("id") UNIQUE,
  "stripe_customer_id" text NOT NULL UNIQUE,
  "email" text,
  "name" text,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "stripe_payments" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" varchar NOT NULL REFERENCES "users"("id"),
  "order_id" varchar REFERENCES "orders"("id"),
  "stripe_payment_intent_id" text UNIQUE,
  "stripe_customer_id" text,
  "amount" real NOT NULL,
  "currency" text NOT NULL DEFAULT 'usd',
  "status" text NOT NULL DEFAULT 'pending',
  "product_type" text NOT NULL,
  "product_id" varchar,
  "product_name" text,
  "metadata" jsonb,
  "receipt_url" text,
  "failure_reason" text,
  "refunded_amount" real,
  "refunded_at" timestamp,
  "completed_at" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp
);
