# devanshmodi.in

Personal site — writing, about, and projects — built with React + TypeScript + Vite. Sidebar layout, dark/light mode, no CMS. The original static site it grew from is preserved in `legacy/`.

## Commands

```bash
npm install      # first time only
npm run dev      # dev server with hot reload
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build locally
```

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

Create a markdown file in `src/posts/` — the filename becomes the URL (`my-new-post.md` → `/posts/my-new-post`):

```md
---
title: My New Post
subtitle: Shown under the title.
excerpt: Shown in the Writing list.
date: 2026-07-20
tags: react, typescript
---

Write normal markdown here. **Bold**, *italics*, `code`,
[links](https://example.com), lists, tables, code blocks — all supported.

## Headings make sections

> Blockquotes work too.
```

That's it — the site picks it up automatically, sorts by date (newest first), and computes the read time from word count.

## Adding a project

Add an entry to `src/data/projects.ts` — `{ name, tagline, description, highlights: string[], tech: string[], link? }`. Skills shown on the About page live in `src/data/skills.ts`.

## Deploying

It's a single-page app, so the host must rewrite all routes to `index.html`:

- **Netlify**: add `public/_redirects` with `/* /index.html 200`
- **Vercel**: add `vercel.json` with a rewrite of `/(.*)` to `/index.html`
- **GitHub Pages**: use a 404.html fallback or hash routing
