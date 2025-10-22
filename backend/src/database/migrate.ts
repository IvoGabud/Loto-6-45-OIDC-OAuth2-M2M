import pool from './db.js';

const migrate = async () => {
  try {
    // Samo u development modu briši postojeće tablice
    if (process.env.NODE_ENV === 'development') {
      await pool.query(`DROP TABLE IF EXISTS tickets CASCADE;`);
      await pool.query(`DROP TABLE IF EXISTS rounds CASCADE;`);
      console.log('Dropped existing tables (development mode)...');
    }

    // Kreiraj tablice ako ne postoje
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
    } else {
      console.log('Migration successful! Tables created if not existing.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
