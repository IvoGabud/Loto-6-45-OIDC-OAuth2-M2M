import 'express-session';

declare module 'express-session' {
  interface SessionData {
    codeVerifier?: string;
    user?: {
      accessToken: string;
      idToken: string | undefined;
      claims: any;
    };
  }
}
