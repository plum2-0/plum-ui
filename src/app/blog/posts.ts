export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string; // ISO date
  image: string; // path in /public
  seoDescription?: string;
  excerpt?: string;
  author?: {
    name: string;
    title?: string;
  };
  tags?: string[];
  keywords?: string[];
  ogImage?: string;
  readingTime?: number; // in minutes
  updatedAt?: string; // ISO date
};

export const posts: BlogPostMeta[] = [
  {
    slug: "validating-product-market-fit-on-reddit",
    title: "How to Find Your First 100 Customers on Reddit - Discover, Engage, Convert Leads",
    date: "2025-02-12",
    image: "/reddit.svg",
    seoDescription: "Learn how to validate product ideas using Reddit insights. Get real customer feedback, identify pain points, and test product concepts before building. Complete guide with frameworks and examples.",
    excerpt: "Most products fail because we validate solutions instead of problems. Reddit flips that dynamic—it's where people confess frustrations in plain language at scale.",
    author: {
      name: "Plum Team",
      title: "Product Validation Experts"
    },
    tags: ["product validation", "reddit marketing", "product-market fit", "startup validation", "customer feedback"],
    keywords: ["product validation", "product concept validation", "validate product ideas", "reddit product validation", "product market fit", "startup validation", "customer validation", "product testing"],
    ogImage: "https://plumsprout.com/og/product-validation-guide.jpg",
    readingTime: 12,
    updatedAt: "2025-02-12"
  },
  {
    slug: "what-is-product-concept-validation",
    title: "What Is Product Concept Validation—and How to Do It Right?",
    date: "2025-02-15",
    image: "/blog/pcv.png",
    seoDescription: "Master product concept validation with our proven I.D.E.A.L. framework. Validate ideas quickly using Reddit communities and real user feedback. Step-by-step guide with templates.",
    excerpt: "Product concept validation is how you prove a specific idea is desirable, clear, and valuable for a defined audience—before investing months in development.",
    author: {
      name: "Plum Team",
      title: "Validation Strategy Experts"
    },
    tags: ["product concept validation", "concept testing", "idea validation", "startup validation", "product development"],
    keywords: ["product concept validation", "concept validation framework", "validate product concept", "idea validation", "concept testing", "startup concept validation", "IDEAL framework", "product validation methods"],
    ogImage: "https://plumsprout.com/og/concept-validation-framework.jpg",
    readingTime: 10,
    updatedAt: "2025-02-15"
  },
  {
    slug: "agency-marketing-on-reddit",
    title: "Why to Run Your Agency Marketing Strategy on Reddit",
    date: "2025-02-16",
    image: "/blog/plum_hug_reddit.png",
    seoDescription: "Discover agency marketing strategies that amplify brand voice on Reddit. Learn targeting, engagement tactics, and ROI measurement for marketing agencies on Reddit.",
    excerpt: "Reddit has quietly become one of the most durable places where real buyers narrate problems, compare options, and report back on what actually worked.",
    author: {
      name: "Plum Team",
      title: "Agency Growth Strategists"
    },
    tags: ["agency marketing strategy", "reddit marketing", "marketing agency", "brand amplification", "social media marketing"],
    keywords: ["agency marketing strategy", "marketing agency reddit", "reddit marketing strategy", "agency growth", "brand amplification", "social media agency", "reddit for agencies", "community marketing"],
    ogImage: "https://plumsprout.com/og/agency-marketing-reddit.jpg",
    readingTime: 8,
    updatedAt: "2025-02-16"
  }
];

export function getPostBySlug(slug: string): BlogPostMeta | undefined {
  return posts.find((p) => p.slug === slug);
}