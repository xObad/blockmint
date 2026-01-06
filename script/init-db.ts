import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "../shared/schema.js";
import { sql } from "drizzle-orm";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const db = drizzle(pool, { schema });

async function initDatabase() {
  console.log("Initializing database...");
  
  try {
    // Test connection
    await pool.query("SELECT NOW()");
    console.log("✓ Database connection successful");
    
    // Create tables using the schema directly
    console.log("Creating tables...");
    
    // Users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        firebase_uid TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        display_name TEXT,
        phone_number TEXT,
        photo_url TEXT,
        role TEXT DEFAULT 'user' NOT NULL,
        is_active BOOLEAN DEFAULT true NOT NULL,
        referral_code TEXT UNIQUE,
        referred_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✓ Users table");

    // Wallets table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS wallets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        symbol TEXT NOT NULL,
        address TEXT,
        balance NUMERIC(20, 8) DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✓ Wallets table");

    // Transactions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        wallet_id TEXT REFERENCES wallets(id),
        type TEXT NOT NULL,
        symbol TEXT NOT NULL,
        amount NUMERIC(20, 8) NOT NULL,
        fee NUMERIC(20, 8) DEFAULT 0,
        status TEXT DEFAULT 'pending' NOT NULL,
        hash TEXT,
        from_address TEXT,
        to_address TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✓ Transactions table");

    // Investment Plans table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS investment_plans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        min_amount NUMERIC(20, 8) NOT NULL,
        max_amount NUMERIC(20, 8) NOT NULL,
        daily_return NUMERIC(10, 4) NOT NULL,
        duration_days INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true NOT NULL,
        description TEXT,
        features TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✓ Investment Plans table");

    // User Investments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_investments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id TEXT NOT NULL REFERENCES investment_plans(id),
        amount NUMERIC(20, 8) NOT NULL,
        daily_return NUMERIC(20, 8) NOT NULL,
        total_return NUMERIC(20, 8) DEFAULT 0 NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'active' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✓ User Investments table");

    // Miner Pricing table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS miner_pricing (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        hash_rate NUMERIC(20, 2) NOT NULL,
        hash_rate_unit TEXT NOT NULL,
        price_usd NUMERIC(20, 2) NOT NULL,
        daily_earning NUMERIC(20, 8) NOT NULL,
        roi_days INTEGER NOT NULL,
        is_available BOOLEAN DEFAULT true NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✓ Miner Pricing table");

    // Withdrawals table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        symbol TEXT NOT NULL,
        amount NUMERIC(20, 8) NOT NULL,
        fee NUMERIC(20, 8) DEFAULT 0 NOT NULL,
        to_address TEXT NOT NULL,
        status TEXT DEFAULT 'pending' NOT NULL,
        tx_hash TEXT,
        admin_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        processed_at TIMESTAMP
      )
    `);
    console.log("✓ Withdrawals table");

    // Notifications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info' NOT NULL,
        is_read BOOLEAN DEFAULT false NOT NULL,
        link TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✓ Notifications table");

    // Main Wallet table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS main_wallet (
        id TEXT PRIMARY KEY,
        symbol TEXT UNIQUE NOT NULL,
        address TEXT,
        balance NUMERIC(20, 8) DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✓ Main Wallet table");

    // Settings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✓ Settings table");

    console.log("\n✅ Database initialization complete!");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

initDatabase().catch(console.error);
