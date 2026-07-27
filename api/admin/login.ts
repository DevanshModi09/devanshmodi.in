import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSessionToken, passwordMatches, setSessionCookie } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { password } = (req.body ?? {}) as { password?: unknown };
  if (typeof password !== 'string' || !passwordMatches(password)) {
    res.status(401).json({ error: 'Incorrect password.' });
    return;
  }

  setSessionCookie(res, createSessionToken());
  res.status(200).json({ ok: true });
}
