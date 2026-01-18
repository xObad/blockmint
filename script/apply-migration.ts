import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function applyMigration() {
  console.log("Applying migrations...");
  
  // Add referral columns
  try {
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code text`);
    console.log("✓ Added referral_code column");
  } catch (e: any) {
    console.log("referral_code may already exist:", e.message);
  }
  
  try {
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by varchar`);
    console.log("✓ Added referred_by column");
  } catch (e: any) {
    console.log("referred_by may already exist:", e.message);
  }
  
  try {
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_wallet_type text`);
    console.log("✓ Added referral_wallet_type column");
  } catch (e: any) {
    console.log("referral_wallet_type may already exist:", e.message);
  }
  
  try {
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_wallet_address text`);
    console.log("✓ Added referral_wallet_address column");
  } catch (e: any) {
    console.log("referral_wallet_address may already exist:", e.message);
  }
  
  // Create feedback_rewards table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS feedback_rewards (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar NOT NULL,
        platform text,
        claimed_at timestamp DEFAULT now(),
        reward_amount real DEFAULT 20,
        hashrate_ths real DEFAULT 0.8,
        expiry_date timestamp,
        status text DEFAULT 'claimed'
      )
    `);
    console.log("✓ Created feedback_rewards table");
  } catch (e: any) {
    console.log("feedback_rewards error:", e.message);
  }
  
  console.log("Migration complete!");
  process.exit(0);
}

applyMigration().catch(console.error);
