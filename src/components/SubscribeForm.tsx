import { useState } from 'react';

type Status = 'idle' | 'loading' | 'done' | 'error';

export default function SubscribeForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  }

  const disabled = status === 'loading' || status === 'done';

  return (
    <form
      className={`subscribe-form${compact ? ' subscribe-form-compact' : ''}`}
      onSubmit={handleSubmit}
    >
      {!compact && <span className="subscribe-form-label">Get new posts by email</span>}
      <div className="subscribe-form-row">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={disabled}
          aria-label="Email address"
        />
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="subscribe-form-hp"
        />
        <button type="submit" disabled={disabled}>
          {status === 'done' ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>
      {status === 'error' && (
        <span className="subscribe-form-error">Something went wrong — try again.</span>
      )}
    </form>
  );
}
