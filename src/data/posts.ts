import type { Post } from '../types';

const files = import.meta.glob('../posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function parsePost(path: string, raw: string): Post {
  const slug = path.split('/').pop()!.replace(/\.md$/, '');
  const meta: Record<string, string> = {};
  let body = raw;

  const frontmatter = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (frontmatter) {
    body = raw.slice(frontmatter[0].length);
    for (const line of frontmatter[1].split('\n')) {
      const separator = line.indexOf(':');
      if (separator > 0) {
        meta[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
      }
    }
  }

  const words = body.trim().split(/\s+/).length;

  return {
    slug,
    title: meta.title ?? slug,
    subtitle: meta.subtitle ?? '',
    excerpt: meta.excerpt ?? '',
    date: meta.date ?? '',
    readTime: `${Math.max(1, Math.round(words / 200))} min read`,
    tags: meta.tags ? meta.tags.split(',').map((tag) => tag.trim()) : [],
    body,
  };
}

export const posts: Post[] = Object.entries(files)
  .map(([path, raw]) => parsePost(path, raw))
  .sort((a, b) => b.date.localeCompare(a.date));

export function getPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}
