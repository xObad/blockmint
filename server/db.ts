// Database connection for admin operations
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "@shared/schema";

const connectionString = process.env.DATABASE_URL_POOLER || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Missing DATABASE_URL. Set DATABASE_URL (or DATABASE_URL_POOLER for Supabase pooler/IPv4).",
  );
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase-managed Postgres
  },
});

export const db = drizzle(pool, { schema });
export { pool };
