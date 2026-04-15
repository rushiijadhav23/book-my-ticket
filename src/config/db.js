//  CREATE TABLE seats (
//      id SERIAL PRIMARY KEY,
//      name VARCHAR(255),
//      isbooked INT DEFAULT 0
//  );
// INSERT INTO seats (isbooked)
// SELECT 0 FROM generate_series(1, 20);
import pg from "pg";

function getValidDatabaseUrl() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return null;

  // Ignore template/example values copied into local .env.
  if (raw.includes("<") || raw.includes(">")) return null;

  try {
    new URL(raw);
    return raw;
  } catch {
    return null;
  }
}

const databaseUrl = getValidDatabaseUrl();
const useConnectionString = Boolean(databaseUrl);
const enableSsl =
  process.env.DB_SSL === "true" ||
  (process.env.NODE_ENV === "production" && useConnectionString);

const poolConfig = useConnectionString
  ? {
      connectionString: databaseUrl,
      ssl: enableSsl ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    };

const pool = new pg.Pool(poolConfig);

export default pool;