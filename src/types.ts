export interface Post {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  date: string;
  tags: string[];
  links: { label: string; url: string }[];
  body: string;
}
