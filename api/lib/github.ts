const OWNER = 'DevanshModi09';
const REPO = 'devanshmodi.in';
const BRANCH = 'main';
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

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
export async function fileExists(path: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/${path}?ref=${BRANCH}`, { headers: headers() });
  if (res.status === 404) return false;
  if (res.ok) return true;
  throw new Error(`GitHub API error checking ${path}: ${res.status}`);
}

/** Creates a new file at `path` on `main`. Caller must have already checked it doesn't exist. */
export async function createFile(path: string, content: Buffer, message: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${path}`, {
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
