import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
      max: 10,
    });
  }
  return pool;
}

let initPromise: Promise<void> | null = null;

async function initDb(db: Pool): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS locations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      photo_data TEXT,
      description TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS clothing_items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      photo_data JSONB NOT NULL DEFAULT '[]',
      tags TEXT[] NOT NULL DEFAULT '{}',
      comments TEXT NOT NULL DEFAULT '',
      location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
      last_worn_date DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE clothing_items ADD COLUMN IF NOT EXISTS stored_in TEXT NOT NULL DEFAULT '';
    ALTER TABLE clothing_items ADD COLUMN IF NOT EXISTS pairs_well_with TEXT NOT NULL DEFAULT '';
  `);
}

export async function getDb(): Promise<Pool> {
  const db = getPool();
  if (!initPromise) {
    initPromise = initDb(db).catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  await initPromise;
  return db;
}
