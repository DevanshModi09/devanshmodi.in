import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Prisma } from './generated/prisma/client.js';
import { prisma } from './lib/prisma.js';
import { isValidEmail } from './lib/validate-email.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = (req.body ?? {}) as { email?: unknown; website?: unknown };

  // Honeypot: real visitors never fill this hidden field, bots that
  // autofill every input do. Pretend success without touching the DB.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    res.status(200).json({ ok: true });
    return;
  }

  const trimmed = typeof body.email === 'string' ? body.email.trim() : body.email;

  if (!isValidEmail(trimmed)) {
    res.status(400).json({ error: 'Enter a valid email address.' });
    return;
  }

  const email = trimmed.toLowerCase();

  try {
    await prisma.subscriber.create({ data: { email } });
    res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const existing = await prisma.subscriber.findUnique({ where: { email } });
      if (existing?.status === 'UNSUBSCRIBED') {
        await prisma.subscriber.update({
          where: { email },
          data: { status: 'CONFIRMED' },
        });
      }
      res.status(200).json({ ok: true });
      return;
    }

    console.error('subscribe error', err);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
}
