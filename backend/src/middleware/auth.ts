import { auth } from 'express-oauth2-jwt-bearer';
import type { Request, Response, NextFunction } from 'express';

// Middleware za provjeru OAuth2 tokena (Machine-to-Machine)
export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE || '',
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || '',
  tokenSigningAlg: 'RS256'
});

// Middleware za provjeru session-based autentifikacije
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Morate biti prijavljeni za izvođenje ove akcije' });
  }
  next();
};
