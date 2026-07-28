export interface RepoRef {
  owner: string;
  repo: string;
}

const BLOG_REPO: RepoRef = { owner: 'DevanshModi09', repo: 'devanshmodi.in' };
export const JOURNAL_REPO: RepoRef = { owner: 'DevanshModi09', repo: 'devanshmodi-journal' };
const BRANCH = 'main';

function apiBase(ref: RepoRef): string {
  return `https://api.github.com/repos/${ref.owner}/${ref.repo}/contents`;
}

function headers(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not set');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'devanshmodi-in-cms',
  };
}

/** Returns true if the given path already exists on `main`. */
export async function fileExists(path: string, ref: RepoRef = BLOG_REPO): Promise<boolean> {
  const res = await fetch(`${apiBase(ref)}/${path}?ref=${BRANCH}`, { headers: headers() });
  if (res.status === 404) return false;
  if (res.ok) return true;
  throw new Error(`GitHub API error checking ${path}: ${res.status}`);
}

/** Creates a new file at `path` on `main`. Caller must have already checked it doesn't exist. */
export async function createFile(
  path: string,
  content: Buffer,
  message: string,
  ref: RepoRef = BLOG_REPO
): Promise<void> {
  const res = await fetch(`${apiBase(ref)}/${path}`, {
    method: 'PUT',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: content.toString('base64'),
      branch: BRANCH,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API error creating ${path}: ${res.status} ${body}`);
  }
}

/** Returns the raw text content of a file. */
export async function getFile(path: string, ref: RepoRef): Promise<string> {
  const res = await fetch(`${apiBase(ref)}/${path}?ref=${BRANCH}`, { headers: headers() });
  if (!res.ok) {
    throw new Error(`GitHub API error reading ${path}: ${res.status}`);
  }
  const data = (await res.json()) as { content: string };
  return Buffer.from(data.content, 'base64').toString('utf8');
}

/** Lists markdown files directly inside a directory. Returns [] if the directory doesn't exist. */
export async function listMarkdownFiles(
  dirPath: string,
  ref: RepoRef
): Promise<{ name: string; path: string }[]> {
  const res = await fetch(`${apiBase(ref)}/${dirPath}?ref=${BRANCH}`, { headers: headers() });
  if (res.status === 404) return [];
  if (!res.ok) {
    throw new Error(`GitHub API error listing ${dirPath}: ${res.status}`);
  }
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) return [];
  return data
    .filter((entry): entry is { name: string; path: string; type: string } => {
      const e = entry as { type?: unknown; name?: unknown };
      return e.type === 'file' && typeof e.name === 'string' && e.name.endsWith('.md');
    })
    .map((entry) => ({ name: entry.name, path: entry.path }));
}
