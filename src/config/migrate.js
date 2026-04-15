import pool from "./db.js";

export async function migrate() {
  // Keep this idempotent: safe to run on every backend start.
  await pool.query(`
    ALTER TABLE IF EXISTS users
      ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
  `);
}

