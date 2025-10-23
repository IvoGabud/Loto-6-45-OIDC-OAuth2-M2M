import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pool from '../database/db.js';

const PgStore = connectPgSimple(session);

export const sessionMiddleware = session({
  store: new PgStore({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true // Automatski kreira tablicu ako ne postoji
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 sata
  }
});
