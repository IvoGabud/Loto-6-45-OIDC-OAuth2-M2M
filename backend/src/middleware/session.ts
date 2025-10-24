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
  proxy: true, // Trust Render.com proxy
  cookie: {
    secure: true, // Uvijek true za HTTPS
    httpOnly: true,
    sameSite: 'none', // none za Auth0 redirect (cross-site)
    maxAge: 24 * 60 * 60 * 1000, // 24 sata
    path: '/' // Eksplicitno postavi path
  }
});
