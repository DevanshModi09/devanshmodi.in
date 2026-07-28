export interface PostInput {
  title?: string;
  subtitle?: string;
  excerpt?: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  links: { label: string; url: string }[];
  body: string;
}

/** Strips a surrounding pair of double quotes added by yamlEscape, if present. */
function yamlUnescape(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"');
  }
  return trimmed;
}

/** Inverse of serializeFrontmatter: parses a raw .md file's frontmatter + body. */
export function parseFrontmatter(raw: string): PostInput {
  const meta: Record<string, string> = {};
  let body = raw;

  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (match) {
    body = raw.slice(match[0].length);
    for (const line of match[1].split('\n')) {
      const separator = line.indexOf(':');
      if (separator > 0) {
        meta[line.slice(0, separator).trim()] = yamlUnescape(line.slice(separator + 1));
      }
    }
  }

  return {
    title: meta.title ?? '',
    subtitle: meta.subtitle ?? '',
    excerpt: meta.excerpt ?? '',
    date: meta.date ?? '',
    tags: meta.tags ? meta.tags.split(',').map((tag) => tag.trim()) : [],
    links: meta.links
      ? meta.links.split(',').map((entry) => {
          const [label, url] = entry.split('|').map((part) => part.trim());
          return { label, url: url ?? label };
        })
      : [],
    body,
  };
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validatePostInput(input: PostInput): string | null {
  if (!input.title?.trim()) return 'Title is required.';
  if (!input.subtitle?.trim()) return 'Subtitle is required.';
  if (!input.excerpt?.trim()) return 'Excerpt is required.';
  if (!DATE_RE.test(input.date)) return 'Date must be in YYYY-MM-DD format.';
  if (!input.body?.trim()) return 'Body cannot be empty.';

  for (const field of ['title', 'subtitle', 'excerpt'] as const) {
    if (input[field]?.includes('\n')) return `${field} cannot contain a newline.`;
  }

  const linkError = validateTagsAndLinks(input);
  if (linkError) return linkError;

  return null;
}

/** Lighter validation for daily journal entries — just a date and a note. */
export function validateJournalInput(input: PostInput): string | null {
  if (!DATE_RE.test(input.date)) return 'Date must be in YYYY-MM-DD format.';
  if (!input.body?.trim()) return 'Entry cannot be empty.';
  if (input.title?.includes('\n')) return 'Title cannot contain a newline.';

  return validateTagsAndLinks(input);
}

function validateTagsAndLinks(input: PostInput): string | null {
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

/** Quotes a frontmatter value if it contains a colon, so GitHub's YAML viewer doesn't choke on it. */
function yamlEscape(value: string): string {
  if (value.includes(':') || value.startsWith('"') || value.startsWith("'")) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

export function serializeFrontmatter(input: PostInput): string {
  const lines = ['---'];
  if (input.title?.trim()) lines.push(`title: ${yamlEscape(input.title.trim())}`);
  if (input.subtitle?.trim()) lines.push(`subtitle: ${yamlEscape(input.subtitle.trim())}`);
  if (input.excerpt?.trim()) lines.push(`excerpt: ${yamlEscape(input.excerpt.trim())}`);
  lines.push(`date: ${input.date.trim()}`);

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
