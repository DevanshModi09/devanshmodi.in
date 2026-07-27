import { randomUUID } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthenticated } from '../lib/auth.js';
import { createFile } from '../lib/github.js';

function sanitizeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? 'image';
  return base.toLowerCase().replace(/[^a-z0-9.-]+/g, '-');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }

  const { filename, data } = (req.body ?? {}) as { filename?: unknown; data?: unknown };
  if (typeof filename !== 'string' || typeof data !== 'string' || !filename || !data) {
    res.status(400).json({ error: 'Missing filename or image data.' });
    return;
  }

  const id = randomUUID().slice(0, 8);
  const path = `public/images/${id}-${sanitizeFilename(filename)}`;

  try {
    await createFile(path, Buffer.from(data, 'base64'), `Add image: ${filename}`);
    res.status(200).json({ url: `/images/${id}-${sanitizeFilename(filename)}` });
  } catch (err) {
    console.error('upload-image error', err);
    res.status(500).json({ error: 'Failed to upload image. Try again.' });
  }
}
