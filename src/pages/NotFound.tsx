import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>That page doesn't exist (yet).</p>
      <Link to="/" className="back-link">
        ← Back to writing
      </Link>
    </div>
  );
}
