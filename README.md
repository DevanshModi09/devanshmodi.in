# devanshmodi.in

Personal site — writing, about, and projects — built with React + TypeScript + Vite. Sidebar layout, dark/light mode, no CMS.

## Commands

```bash
npm install      # first time only
npm run dev      # dev server with hot reload
npm run build    # type-check, build into dist/, then prerender (see below)
npm run preview  # serve the production build locally
```

`npm run build` chains a `postbuild` step (`scripts/prerender.mjs`) that does two
things the dev server doesn't:

- generates a 1200×630 OG image per post into `dist/og/<slug>.png` (satori → resvg)
- writes a static `index.html` per route (`/about`, `/projects`, `/posts/:slug`)
  with real `<title>`, description, Open Graph and Twitter card tags baked in

That's what makes links unfurl properly when pasted into Slack, X, iMessage, etc.
Crawlers don't run JS, so without this step every URL would share the generic tags
from the root `index.html`. Use `npm run preview` to check embeds — `npm run dev`
skips prerendering entirely.

## Structure

- `/` — Writing (post list)
- `/posts/:slug` — a post
- `/about` — about page (`src/pages/About.tsx`, edit the JSX directly)
- `/projects` — projects list (data in `src/data/projects.ts`)

## Making it yours

- **Name, bio, GitHub/email links** — `src/config.ts`
- **Sidebar nav items** — `src/components/Sidebar.tsx`
- **Colors, fonts, sidebar width** — CSS variables and `.layout` at the top of `src/index.css`

## Adding a post

Copy `post-template.md` into `src/posts/` and rename it — the filename becomes the
URL (`my-new-post.md` → `/posts/my-new-post`). The template carries the full field
reference in a comment block; delete that block before publishing.

```md
---
title: My New Post
subtitle: Shown under the title.
excerpt: Shown in the Writing list.
date: 2026-07-20
tags: react, typescript
links: GitHub repo | https://github.com/you/repo, Docs | https://example.com
---

Write normal markdown here. **Bold**, _italics_, `code`,
[links](https://example.com), lists, tables, code blocks — all supported.

## Headings make sections

> Blockquotes work too.
```

`title`, `subtitle`, `excerpt` and `date` are required; `tags` and `links` can be
omitted. Both are comma-separated, and each `links` entry is a `Label | URL` pair
rendered as a related-links row on the post.

Frontmatter is parsed line by line, split on the first `:` — so it's a convention,
not real YAML. Nesting, block scalars and quoted values aren't supported, and a
value containing a comma will split into two items.

That's it — the site picks the post up automatically and sorts by date, newest
first.

## Adding a project

Add an entry to `src/data/projects.ts` — `{ name, tagline, description, highlights: string[], tech: string[], link? }`. Skills shown on the About page live in `src/data/skills.ts`.

## Deploying

Deployed on Vercel; `vercel.json` is already committed and rewrites `/(.*)` to
`/index.html` so client-side routes survive a hard refresh.

The rewrite is a fallback, not a blanket redirect — Vercel matches static files
first, so the prerendered `dist/posts/<slug>/index.html` is served ahead of it and
keeps its own meta tags. Anything without a prerendered file falls through to the
SPA shell.

On another host, keep both halves of that behaviour: serve `dist/` as static files
first, then rewrite whatever's left to `index.html`. Netlify does this with a
`public/_redirects` line of `/* /index.html 200`. GitHub Pages has no rewrite
support — a 404.html fallback works for routing but loses per-post embeds.
