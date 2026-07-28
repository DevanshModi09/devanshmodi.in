import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthenticated } from '../lib/auth.js';
import { createFile, fileExists, JOURNAL_REPO } from '../lib/github.js';
import {
  serializeFrontmatter,
  slugify,
  validateJournalInput,
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

  const { target, ...input } = (req.body ?? {}) as PostInput & { target?: 'blog' | 'journal' };
  if (!input) {
    res.status(400).json({ error: 'Missing request body.' });
    return;
  }

  const isJournal = target === 'journal';
  const validationError = isJournal ? validateJournalInput(input) : validatePostInput(input);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  const slug = slugify(input.title || input.date);
  if (!slug) {
    res.status(400).json({ error: 'Title must contain at least one letter or number.' });
    return;
  }

  const path = isJournal ? `entries/${slug}.md` : `src/posts/${slug}.md`;
  const ref = isJournal ? JOURNAL_REPO : undefined;

  try {
    if (await fileExists(path, ref)) {
      res.status(409).json({ error: 'A post with this slug already exists.' });
      return;
    }

    const content = serializeFrontmatter(input);
    await createFile(
      path,
      Buffer.from(content, 'utf8'),
      `Add ${isJournal ? 'journal entry' : 'post'}: ${input.title || input.date}`,
      ref
    );

    res.status(200).json({ ok: true, slug });
  } catch (err) {
    console.error('publish error', err);
    res.status(500).json({ error: 'Failed to publish. Try again.' });
  }
}
