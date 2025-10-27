import pool from './db.js';

const migrate = async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await pool.query(`DROP TABLE IF EXISTS tickets CASCADE;`);
      await pool.query(`DROP TABLE IF EXISTS rounds CASCADE;`);
      console.log('Dropped existing tables (development mode)...');
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON session (expire);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rounds (
        id SERIAL PRIMARY KEY,
        is_active BOOLEAN DEFAULT false,
        drawn_numbers INTEGER[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        round_id INTEGER REFERENCES rounds(id),
        id_number VARCHAR(20) NOT NULL,
        numbers INTEGER[] NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    if (process.env.NODE_ENV === 'development') {
      console.log('Migration successful! Database is now clean.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
