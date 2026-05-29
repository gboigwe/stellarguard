import { Pool } from "pg";
import { config } from "./config";

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: config.dbPoolMax,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  console.error("Unexpected idle client error", err);
});

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  contract_id TEXT NOT NULL,
  topic_1 TEXT,
  topic_2 TEXT,
  event_name TEXT,
  event_topics JSONB,
  event_data JSONB,
  ledger INTEGER NOT NULL,
  timestamp BIGINT,
  cursor TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_contract ON events(contract_id);
CREATE INDEX IF NOT EXISTS idx_events_topics ON events(topic_1, topic_2);
CREATE INDEX IF NOT EXISTS idx_events_ledger ON events(ledger);
CREATE INDEX IF NOT EXISTS idx_events_cursor ON events(cursor);
CREATE INDEX IF NOT EXISTS idx_events_name ON events(event_name);

CREATE TABLE IF NOT EXISTS event_cursor (
  id INTEGER PRIMARY KEY DEFAULT 1,
  cursor TEXT,
  last_ledger INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_events_updated_at'
  ) THEN
    CREATE TRIGGER trg_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_event_cursor_updated_at'
  ) THEN
    CREATE TRIGGER trg_event_cursor_updated_at
    BEFORE UPDATE ON event_cursor
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;
`;

export async function initializeSchema(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(SCHEMA_SQL);
    console.log("Database schema initialized successfully.");
  } finally {
    client.release();
  }
}

export interface StoredEvent {
  contract_id: string;
  topic_1: string | null;
  topic_2: string | null;
  event_name: string | null;
  event_topics: unknown[] | null;
  event_data: Record<string, unknown>;
  ledger: number;
  timestamp: number | null;
  cursor: string | null;
}

export async function insertEvent(event: StoredEvent): Promise<void> {
  await pool.query(
    `INSERT INTO events (contract_id, topic_1, topic_2, event_name, event_topics, event_data, ledger, timestamp, cursor)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      event.contract_id,
      event.topic_1,
      event.topic_2,
      event.event_name,
      event.event_topics ? JSON.stringify(event.event_topics) : null,
      JSON.stringify(event.event_data),
      event.ledger,
      event.timestamp,
      event.cursor,
    ]
  );
}

export async function insertEvents(events: StoredEvent[]): Promise<void> {
  if (events.length === 0) return;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const event of events) {
      await client.query(
        `INSERT INTO events (contract_id, topic_1, topic_2, event_name, event_topics, event_data, ledger, timestamp, cursor)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          event.contract_id,
          event.topic_1,
          event.topic_2,
          event.event_name,
          event.event_topics ? JSON.stringify(event.event_topics) : null,
          JSON.stringify(event.event_data),
          event.ledger,
          event.timestamp,
          event.cursor,
        ]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getLastCursor(): Promise<{
  cursor: string | null;
  lastLedger: number | null;
}> {
  const result = await pool.query(
    "SELECT cursor, last_ledger FROM event_cursor WHERE id = 1"
  );
  if (result.rows.length === 0) {
    return { cursor: null, lastLedger: null };
  }
  return {
    cursor: result.rows[0].cursor,
    lastLedger: result.rows[0].last_ledger,
  };
}

export async function updateCursor(
  cursor: string,
  lastLedger: number
): Promise<void> {
  await pool.query(
    `INSERT INTO event_cursor (id, cursor, last_ledger, updated_at)
     VALUES (1, $1, $2, NOW())
     ON CONFLICT (id) DO UPDATE SET cursor = $1, last_ledger = $2, updated_at = NOW()`,
    [cursor, lastLedger]
  );
}


