import { Link } from 'react-router-dom';
import type { Post } from '../types';
import { formatDate } from '../utils/date';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="post-card">
      <Link to={`/posts/${post.slug}`} className="post-link">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <h3>{post.title}</h3>
        <p className="post-excerpt">{post.excerpt}</p>
        <span className="post-meta">{post.readTime}</span>
        <span className="post-tags">
          {post.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </span>
      </Link>
    </article>
  );
}
