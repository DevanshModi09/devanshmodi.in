// Renders the "terminal" social-card design (dark, mono breadcrumb + rust
// outlined tags) to a real 1200x630 PNG per post, using satori (layout) +
// resvg (rasterize) -- the same approach Vercel's own OG image API uses.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const interBold = readFileSync(
  join(root, 'node_modules/@fontsource/inter/files/inter-latin-700-normal.woff')
);
const monoRegular = readFileSync(
  join(root, 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff')
);

const bg = '#131312';
const text = '#e6e6e4';
const textFaint = '#6e6e69';
const rust = '#d98b6e';

function h(type, props, ...children) {
  return { type, props: { ...props, children: children.flat() } };
}

function buildTree({ slug, title, tags }) {
  return h(
    'div',
    {
      style: {
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: bg,
        color: text,
        padding: '60px 68px',
        borderLeft: `10px solid ${rust}`,
        fontFamily: 'Inter',
      },
    },
    h(
      'div',
      { style: { display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 22, color: textFaint } },
      h('span', { style: { color: rust, marginRight: 10 } }, '~'),
      h('span', {}, `posts/${slug}`)
    ),
    h(
      'div',
      { style: { display: 'flex', fontSize: 52, fontWeight: 700, lineHeight: 1.15, marginTop: 34, maxWidth: 950 } },
      title
    ),
    h(
      'div',
      { style: { display: 'flex', gap: 14, marginTop: 30, flexWrap: 'wrap' } },
      ...tags.map((tag) =>
        h(
          'div',
          {
            style: {
              display: 'flex',
              fontFamily: 'JetBrains Mono',
              border: `1.5px solid ${rust}`,
              color: rust,
              padding: '7px 16px',
              borderRadius: 20,
              fontSize: 20,
            },
          },
          tag
        )
      )
    ),
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: 14 } },
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: 12,
            background: text,
            color: bg,
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: -0.4,
          },
        },
        'dm'
      ),
      h('div', { style: { display: 'flex', color: textFaint, fontSize: 20 } }, 'devanshmodi.in')
    )
  );
}

export async function renderOgImage({ slug, title, tags }) {
  const svg = await satori(buildTree({ slug, title, tags }), {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
      { name: 'JetBrains Mono', data: monoRegular, weight: 400, style: 'normal' },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  return resvg.render().asPng();
}
