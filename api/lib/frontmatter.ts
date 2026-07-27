export interface PostInput {
  title: string;
  subtitle: string;
  excerpt: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  links: { label: string; url: string }[];
  body: string;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validatePostInput(input: PostInput): string | null {
  if (!input.title?.trim()) return 'Title is required.';
  if (!input.subtitle?.trim()) return 'Subtitle is required.';
  if (!input.excerpt?.trim()) return 'Excerpt is required.';
  if (!DATE_RE.test(input.date)) return 'Date must be in YYYY-MM-DD format.';
  if (!input.body?.trim()) return 'Body cannot be empty.';

  for (const field of ['title', 'subtitle', 'excerpt'] as const) {
    if (input[field].includes('\n')) return `${field} cannot contain a newline.`;
  }

  for (const tag of input.tags ?? []) {
    if (tag.includes(',')) return `Tag "${tag}" cannot contain a comma.`;
  }
  for (const link of input.links ?? []) {
    if (link.label.includes(',') || link.url.includes(',')) {
      return `Link "${link.label}" cannot contain a comma in its label or URL.`;
    }
    if (link.label.includes('|') || link.url.includes('|')) {
      return `Link "${link.label}" cannot contain a "|" character.`;
    }
  }

  return null;
}

export function serializeFrontmatter(input: PostInput): string {
  const lines = [
    '---',
    `title: ${input.title.trim()}`,
    `subtitle: ${input.subtitle.trim()}`,
    `excerpt: ${input.excerpt.trim()}`,
    `date: ${input.date.trim()}`,
  ];

  if (input.tags?.length > 0) {
    lines.push(`tags: ${input.tags.map((t) => t.trim()).join(', ')}`);
  }
  if (input.links?.length > 0) {
    lines.push(
      `links: ${input.links.map((l) => `${l.label.trim()} | ${l.url.trim()}`).join(', ')}`
    );
  }

  lines.push('---', '');
  return lines.join('\n') + input.body;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
