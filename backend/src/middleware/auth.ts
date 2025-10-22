import { auth } from 'express-oauth2-jwt-bearer';

// Middleware za provjeru OAuth2 tokena (Machine-to-Machine)
export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE || '',
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || '',
  tokenSigningAlg: 'RS256'
});
