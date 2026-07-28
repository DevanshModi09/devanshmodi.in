import { useEffect, useState } from 'react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import Tag from '../components/Tag';
import type { Post } from '../types';
import { formatDate } from '../utils/date';

type Phase = 'loading' | 'login' | 'unlocked';

function previewText(entry: Post): string {
  if (entry.excerpt) return entry.excerpt;
  const plain = entry.body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[`*_#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > 140 ? `${plain.slice(0, 140).trim()}…` : plain;
}

export default function Journal() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Post[] | null>(null);
  const [entriesError, setEntriesError] = useState<string | null>(null);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Daily Journal';

    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);

    fetch('/api/journal/session')
      .then((r) => r.json())
      .then((data) => setPhase(data.authenticated ? 'unlocked' : 'login'))
      .catch(() => setPhase('login'));

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'unlocked') return;
    fetch('/api/journal/entries')
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? 'Failed to load entries.');
        setEntries(data.entries ?? []);
      })
      .catch((err) => setEntriesError(err.message ?? 'Failed to load entries.'));
  }, [phase]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch('/api/journal/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setPhase('unlocked');
    } else {
      const data = await res.json().catch(() => ({}));
      setLoginError(data.error ?? 'Login failed.');
    }
  }

  if (phase === 'loading' || (phase === 'unlocked' && entries === null && !entriesError)) {
    return <p className="page-body">Loading…</p>;
  }

  if (phase === 'login') {
    return (
      <section className="page">
        <h1 className="page-title">Daily Journal</h1>
        <div className="page-body">
          <p>This section is private. Ask me for the password.</p>
        </div>
        <div className="admin-login">
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
            />
            <button type="submit">Unlock</button>
            {loginError && <p className="admin-error">{loginError}</p>}
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <h1 className="page-title">Daily Journal</h1>
      <div className="page-body">
        <p>Documenting the daily grind of getting better.</p>
      </div>

      {entriesError && <p className="admin-error">{entriesError}</p>}

      {entries?.length === 0 && <p className="page-body">No entries yet — check back soon.</p>}

      {entries?.map((entry) => {
        const isOpen = expandedSlug === entry.slug;
        return (
          <article key={entry.slug} className="post-card">
            <button
              type="button"
              className="post-link journal-entry-toggle"
              onClick={() => setExpandedSlug(isOpen ? null : entry.slug)}
              aria-expanded={isOpen}
            >
              <span className="post-topline">
                <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                <span className="post-tags">
                  {entry.tags.map((tag) => (
                    <Tag key={tag} name={tag} />
                  ))}
                </span>
              </span>
              <h3>{entry.title || formatDate(entry.date)}</h3>
              {!isOpen && <p className="post-excerpt">{previewText(entry)}</p>}
            </button>
            {isOpen && (
              <div className="article-body journal-entry-body">
                <MarkdownRenderer body={entry.body} />
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
