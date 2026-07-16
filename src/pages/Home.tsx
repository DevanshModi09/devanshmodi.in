import PostCard from '../components/PostCard';
import { posts } from '../data/posts';

export default function Home() {
  return (
    <section className="page">
      <h1 className="page-title">Writing</h1>
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </section>
  );
}
