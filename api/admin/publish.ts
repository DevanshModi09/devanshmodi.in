import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthenticated } from '../lib/auth.js';
import { createFile, fileExists } from '../lib/github.js';
import {
  serializeFrontmatter,
  slugify,
  validatePostInput,
  type PostInput,
} from '../lib/frontmatter.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }

  const input = req.body as PostInput | undefined;
  if (!input) {
    res.status(400).json({ error: 'Missing request body.' });
    return;
  }

  const validationError = validatePostInput(input);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  const slug = slugify(input.title);
  if (!slug) {
    res.status(400).json({ error: 'Title must contain at least one letter or number.' });
    return;
  }

  const path = `src/posts/${slug}.md`;

  try {
    if (await fileExists(path)) {
      res.status(409).json({ error: 'A post with this slug already exists.' });
      return;
    }

    const content = serializeFrontmatter(input);
    await createFile(path, Buffer.from(content, 'utf8'), `Add post: ${input.title}`);

    res.status(200).json({ ok: true, slug });
  } catch (err) {
    console.error('publish error', err);
    res.status(500).json({ error: 'Failed to publish. Try again.' });
  }
}
