
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(root, 'dist');
const postsDir = join(root, 'src/posts');
const baseUrl = 'https://devanshmodi.in';
const defaultImage = `${baseUrl}/favicon-512.png`;
const siteName = 'Devansh Modi';

function parseFrontmatter(raw) {
  const meta = {};
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (match) {
    for (const line of match[1].split('\n')) {
      const sep = line.indexOf(':');
      if (sep > 0) meta[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
    }
  }
  return meta;
}

function getPosts() {
  return readdirSync(postsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.replace(/\.md$/, '');
      const meta = parseFrontmatter(readFileSync(join(postsDir, f), 'utf8'));
      return { slug, title: meta.title ?? slug, excerpt: meta.excerpt ?? meta.subtitle ?? '' };
    });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function render(template, { path, title, description, image }) {
  const url = `${baseUrl}${path}`;
  const fullTitle = escapeHtml(title);
  const desc = escapeHtml(description);

  let html = template;
  html = html.replace(/<title>.*?<\/title>/, `<title>${fullTitle}</title>`);
  html = html.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${url}" />`);
  html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${desc}" />`);
  html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${fullTitle}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${desc}" />`);
  html = html.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${url}" />`);
  html = html.replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${image}" />`);
  html = html.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${fullTitle}" />`);
  html = html.replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${desc}" />`);
  html = html.replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${image}" />`);
  return html;
}

const template = readFileSync(join(distDir, 'index.html'), 'utf8');

const routes = [
  {
    path: '/about',
    title: `About — ${siteName}`,
    description: 'Full-stack developer — TypeScript, React, Node.js, Next.js, Postgres, Golang, Docker, AWS.',
    image: defaultImage,
  },
  {
    path: '/projects',
    title: `Projects — ${siteName}`,
    description: 'Things I have built — side projects and tools.',
    image: defaultImage,
  },
  ...getPosts().map((post) => ({
    path: `/posts/${post.slug}`,
    title: `${post.title} — ${siteName}`,
    description: post.excerpt || `${post.title} — a post by ${siteName}.`,
    image: defaultImage,
  })),
];

for (const route of routes) {
  const html = render(template, route);
  const outDir = join(distDir, route.path);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html);
  console.log(`prerendered ${route.path}`);
}

console.log(`prerendered ${routes.length} route(s)`);
