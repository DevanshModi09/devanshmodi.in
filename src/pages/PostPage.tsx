import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { site } from '../config';
import { getPost } from '../data/posts';
import { formatDate } from '../utils/date';
import Tag from '../components/Tag';
import MarkdownRenderer from '../components/MarkdownRenderer';
import NotFound from './NotFound';

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPost(slug) : undefined;

  useEffect(() => {
    if (post) {
      document.title = `${post.title} — ${site.title}${site.logoSuffix}`;
    }
    window.scrollTo(0, 0);
    return () => {
      document.title = `${site.author.name}`;
    };
  }, [post]);

  if (!post) return <NotFound />;

  return (
    <article className="article">
      <header className="article-header">
        <h1>{post.title}</h1>
        <p className="article-subtitle">{post.subtitle}</p>
        <p className="article-meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="article-tags">
            {post.tags.map((tag) => (
              <Tag key={tag} name={tag} />
            ))}
          </span>
        </p>
      </header>

      <div className="article-body">
        <MarkdownRenderer body={post.body} />
      </div>

      {post.links.length > 0 && (
        <section className="article-related">
          <span className="article-related-label">Related links</span>
          {post.links.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
              {link.label} ↗
            </a>
          ))}
        </section>
      )}

      <footer className="article-footer">
        <Link to="/" className="back-link">
          ← Back to blogs
        </Link>
      </footer>
    </article>
  );
}
