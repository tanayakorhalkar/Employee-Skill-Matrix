import { Pool } from 'pg';

// Create a PostgreSQL connection pool using DATABASE_URL if configured
const databaseUrl = process.env.DATABASE_URL;

export const pgPool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  : null;

/**
 * Test connectivity to PostgreSQL
 */
export async function testPostgresConnection(): Promise<boolean> {
  if (!pgPool) return false;
  try {
    const client = await pgPool.connect();
    const res = await client.query('SELECT NOW()');
    client.release();
    console.log('Connected to PostgreSQL successfully at:', res.rows[0].now);
    return true;
  } catch (err) {
    console.warn('PostgreSQL connection attempt failed:', err instanceof Error ? err.message : err);
    return false;
  }
}
