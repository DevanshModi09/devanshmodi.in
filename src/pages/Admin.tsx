import { useEffect, useState } from 'react';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CodeToggle,
  CreateLink,
  InsertImage,
  InsertCodeBlock,
  ListsToggle,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import MarkdownRenderer from '../components/MarkdownRenderer';

async function uploadImage(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const data = dataUrl.split(',', 2)[1];
  const res = await fetch('/api/admin/upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, contentType: file.type, data }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? 'Image upload failed.');
  return json.url;
}

type Phase = 'loading' | 'login' | 'editor';
type PublishState = 'idle' | 'publishing' | 'done' | 'error';

interface LinkInput {
  label: string;
  url: string;
}

export default function Admin() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tags, setTags] = useState('');
  const [links, setLinks] = useState<LinkInput[]>([]);
  const [body, setBody] = useState('');
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const [publishState, setPublishState] = useState<PublishState>('idle');
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.title = 'Admin';

    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);

    fetch('/api/admin/session')
      .then((r) => r.json())
      .then((data) => setPhase(data.authenticated ? 'editor' : 'login'))
      .catch(() => setPhase('login'));

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setPhase('editor');
    } else {
      const data = await res.json().catch(() => ({}));
      setLoginError(data.error ?? 'Login failed.');
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    setPhase('login');
  }

  function addLink() {
    setLinks((prev) => [...prev, { label: '', url: '' }]);
  }

  function updateLink(index: number, field: keyof LinkInput, value: string) {
    setLinks((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  }

  function removeLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handlePublish() {
    setPublishState('publishing');
    setPublishError(null);
    const res = await fetch('/api/admin/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        subtitle,
        excerpt,
        date,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        links: links.filter((l) => l.label.trim() && l.url.trim()),
        body,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setPublishState('done');
      setPublishedSlug(data.slug ?? null);
    } else {
      setPublishError(data.error ?? 'Publish failed.');
      setPublishState('error');
    }
  }

  if (phase === 'loading') return <p className="admin-loading">Loading…</p>;

  if (phase === 'login') {
    return (
      <div className="admin-login">
        <h1>Admin</h1>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
          />
          <button type="submit">Log in</button>
          {loginError && <p className="admin-error">{loginError}</p>}
        </form>
      </div>
    );
  }

  const publishDisabled = publishState === 'publishing' || publishState === 'done';

  return (
    <div className="admin-editor">
      <header className="admin-editor-header">
        <h1>New post</h1>
        <div className="admin-editor-actions">
          <button type="button" onClick={() => setView(view === 'edit' ? 'preview' : 'edit')}>
            {view === 'edit' ? 'Preview' : 'Edit'}
          </button>
          <button type="button" onClick={handlePublish} disabled={publishDisabled}>
            {publishState === 'done' ? 'Published' : 'Publish'}
          </button>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {publishState === 'error' && <p className="admin-error">{publishError}</p>}
      {publishState === 'done' && (
        <p className="admin-success">
          Published{publishedSlug ? ` — /posts/${publishedSlug}` : ''} — deploying now, live in
          about a minute.
        </p>
      )}

      {view === 'edit' ? (
        <div className="admin-fields">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Subtitle"
          />
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Excerpt"
          />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags, comma separated"
          />

          <div className="admin-links">
            <span className="admin-links-label">Links</span>
            {links.map((link, i) => (
              <div className="admin-link-row" key={i}>
                <input
                  value={link.label}
                  onChange={(e) => updateLink(i, 'label', e.target.value)}
                  placeholder="Label"
                />
                <input
                  value={link.url}
                  onChange={(e) => updateLink(i, 'url', e.target.value)}
                  placeholder="URL"
                />
                <button type="button" onClick={() => removeLink(i)} aria-label="Remove link">
                  ×
                </button>
              </div>
            ))}
            <button type="button" onClick={addLink} className="admin-link-add">
              + Add link
            </button>
          </div>

          <div className="admin-mdx-editor">
            <MDXEditor
              className={theme === 'dark' ? 'dark-theme' : undefined}
              markdown={body}
              onChange={setBody}
              contentEditableClassName="admin-mdx-content"
              plugins={[
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                markdownShortcutPlugin(),
                codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
                codeMirrorPlugin({
                  codeBlockLanguages: {
                    js: 'JavaScript',
                    jsx: 'JSX',
                    ts: 'TypeScript',
                    tsx: 'TSX',
                    go: 'Go',
                    python: 'Python',
                    bash: 'Bash',
                    json: 'JSON',
                    css: 'CSS',
                    html: 'HTML',
                    md: 'Markdown',
                  },
                }),
                linkPlugin(),
                linkDialogPlugin(),
                imagePlugin({ imageUploadHandler: uploadImage }),
                toolbarPlugin({
                  toolbarContents: () => (
                    <>
                      <UndoRedo />
                      <BoldItalicUnderlineToggles />
                      <BlockTypeSelect />
                      <CodeToggle />
                      <CreateLink />
                      <InsertImage />
                      <InsertCodeBlock />
                      <ListsToggle />
                    </>
                  ),
                }),
              ]}
            />
          </div>
        </div>
      ) : (
        <article className="article-body admin-preview">
          <MarkdownRenderer body={body} />
        </article>
      )}
    </div>
  );
}
