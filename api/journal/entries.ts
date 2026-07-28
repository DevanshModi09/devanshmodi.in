import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthenticated } from '../lib/journal-auth.js';
import { getFile, JOURNAL_REPO, listMarkdownFiles } from '../lib/github.js';
import { parseFrontmatter } from '../lib/frontmatter.js';

const DIR = 'entries';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }

  try {
    const files = await listMarkdownFiles(DIR, JOURNAL_REPO);
    const entries = await Promise.all(
      files.map(async (file) => {
        const raw = await getFile(file.path, JOURNAL_REPO);
        const parsed = parseFrontmatter(raw);
        return { ...parsed, slug: file.name.replace(/\.md$/, '') };
      })
    );
    entries.sort((a, b) => b.date.localeCompare(a.date));
    res.status(200).json({ entries });
  } catch (err) {
    console.error('journal entries error', err);
    res.status(500).json({ error: 'Failed to load journal entries.' });
  }
}
