CREATE TABLE "auto_withdraw_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"currency" text DEFAULT 'USDT' NOT NULL,
	"network" text DEFAULT 'trc20' NOT NULL,
	"wallet_address" text,
	"period" text DEFAULT 'monthly' NOT NULL,
	"min_amount" real DEFAULT 10 NOT NULL,
	"last_withdraw_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "auto_withdraw_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "auto_withdraw_settings" ADD CONSTRAINT "auto_withdraw_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;