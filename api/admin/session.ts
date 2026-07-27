import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearSessionCookie, isAuthenticated } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    res.status(200).json({ authenticated: isAuthenticated(req) });
    return;
  }

  if (req.method === 'DELETE') {
    clearSessionCookie(res);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
