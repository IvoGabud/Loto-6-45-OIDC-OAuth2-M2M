import express from 'express';
import type { Request, Response } from 'express';
import * as oauth from 'openid-client';

const router = express.Router();

let config: oauth.Configuration | null = null;

// Inicijalizacija OpenID Client
const getConfig = async () => {
  if (config) return config;

  const issuerUrl = new URL(process.env.AUTH0_ISSUER_BASE_URL!);
  const authServer = await oauth.discovery(
    issuerUrl,
    process.env.AUTH0_CLIENT_ID!,
    process.env.AUTH0_CLIENT_SECRET!
  );

  config = authServer;
  return config;
};

// GET /auth/login - Rozpoczni prijavu
router.get('/login', async (req: Request, res: Response) => {
  try {
    console.log('=== LOGIN REQUEST ===');
    console.log('AUTH0_ISSUER_BASE_URL:', process.env.AUTH0_ISSUER_BASE_URL);
    console.log('AUTH0_CLIENT_ID:', process.env.AUTH0_CLIENT_ID?.substring(0, 10) + '...');
    console.log('AUTH0_CALLBACK_URL:', process.env.AUTH0_CALLBACK_URL);

    const authServer = await getConfig();
    console.log('Auth server configured successfully');

    const codeVerifier = oauth.randomPKCECodeVerifier();
    const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier);
    console.log('PKCE codes generated');

    req.session.codeVerifier = codeVerifier;

    // Eksplicitno sačuvaj sesiju prije redirecta
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          reject(err);
        } else {
          console.log('Code verifier saved to session');
          console.log('Session ID at login:', req.sessionID);
          resolve();
        }
      });
    });

    const authUrl = oauth.buildAuthorizationUrl(authServer, {
      scope: 'openid profile email',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      redirect_uri: process.env.AUTH0_CALLBACK_URL!
    });

    console.log('Redirecting to:', authUrl.href);
    res.redirect(authUrl.href);
  } catch (error) {
    console.error('Login error DETAILS:', error);
    res.status(500).json({ error: 'Authentication failed', details: error instanceof Error ? error.message : String(error) });
  }
});

// GET /auth/callback - Callback nakon prijave
router.get('/callback', async (req: Request, res: Response) => {
  try {
    console.log('=== CALLBACK REQUEST ===');
    console.log('Session ID:', req.sessionID);
    console.log('Cookies:', req.headers.cookie);
    console.log('Code verifier exists:', !!req.session.codeVerifier);

    const authServer = await getConfig();

    // Koristi HTTPS u production (Render.com proxy)
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const currentUrl = new URL(req.url, `${protocol}://${host}`);

    // Provjeri da li postoji code verifier
    if (!req.session.codeVerifier) {
      console.error('ERROR: Code verifier missing from session!');
      return res.status(400).json({ error: 'Missing code verifier' });
    }

    console.log('Code verifier found, proceeding with token exchange');

    const tokens = await oauth.authorizationCodeGrant(
      authServer,
      currentUrl,
      {
        pkceCodeVerifier: req.session.codeVerifier
      }
    );

    // Dohvati claims iz ID tokena
    let claims: any = {};
    if (tokens.id_token) {
      // Decode JWT manually (base64)
      const parts = tokens.id_token.split('.');
      if (parts.length === 3 && parts[1]) {
        const payload = parts[1];
        const decoded = Buffer.from(payload, 'base64').toString('utf-8');
        claims = JSON.parse(decoded);
      }
    }

    // Postavi user session
    if (tokens.access_token) {
      req.session.user = {
        accessToken: tokens.access_token,
        idToken: tokens.id_token,
        claims: claims
      };
    }

    delete req.session.codeVerifier;

    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ error: 'Authentication callback failed' });
  }
});

// GET /auth/user - Dohvati trenutnog korisnika
router.get('/user', (req: Request, res: Response) => {
  if (req.session.user) {
    res.json(req.session.user.claims);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// GET /auth/logout - Odjava (preusmjeri na Auth0 logout)
router.get('/logout', (req: Request, res: Response) => {
  const returnTo = encodeURIComponent(process.env.FRONTEND_URL || 'http://localhost:5173');
  const logoutUrl = `${process.env.AUTH0_ISSUER_BASE_URL}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${returnTo}`;

  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
    }
    res.redirect(logoutUrl);
  });
});

export default router;
