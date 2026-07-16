import { Link } from 'react-router-dom';
import type { Post } from '../types';
import { formatDate } from '../utils/date';
import Tag from './Tag';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="post-card">
      <Link to={`/posts/${post.slug}`} className="post-link">
        <span className="post-topline">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="post-tags">
            {post.tags.map((tag) => (
              <Tag key={tag} name={tag} />
            ))}
          </span>
        </span>
        <h3>{post.title}</h3>
        <p className="post-excerpt">{post.excerpt}</p>
      </Link>
    </article>
  );
}
