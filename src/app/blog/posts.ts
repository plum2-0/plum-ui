export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string; // ISO date
  image: string; // path in /public
};

export const posts: BlogPostMeta[] = [
  {
    slug: "validating-product-market-fit-on-reddit",
    title: "Validating Product–Market Fit on Reddit: A Field Guide for Builders",
    date: "2025-02-12",
    image: "/reddit.svg",
  },
  {
    slug: "what-is-product-concept-validation",
    title: "What is Product Concept Validation (and how to do it right)?",
    date: "2025-02-15",
    image: "/blog/pcv.png",
  }
];

export function getPostBySlug(slug: string): BlogPostMeta | undefined {
  return posts.find((p) => p.slug === slug);
} 