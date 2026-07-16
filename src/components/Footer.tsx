import { Link } from 'react-router-dom';
import { site } from '../config';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <p>
          &copy; {site.year} {site.author.name} ·{' '}
          <Link to="/">
            {site.title}
            {site.logoSuffix}
          </Link>
        </p>
      </div>
    </footer>
  );
}
