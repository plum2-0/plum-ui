import Link from "next/link";
import Image from "next/image";
import { posts as allPosts } from "./posts";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function BlogIndexPage() {
  const sorted = [...allPosts].sort((a, b) => (a.date > b.date ? -1 : 1));

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0" style={{
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3), transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.2), transparent 50%),
          linear-gradient(135deg, #0F0F23 0%, #1A0B2E 25%, #2D1B3D 50%, #1E293B 75%, #0F172A 100%)
        `,
      }} />

      <main className="relative z-10 mx-6 my-8">
        <div className="max-w-7xl mx-auto mb-4">
          <Link href="/" className="text-white/70 hover:text-white">← Home</Link>
        </div>
        <div className="glass-card rounded-3xl px-4 lg:px-8 py-8">
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold mb-6 text-white tracking-tight text-center">
            Blog
          </h1>
          <p className="text-center text-white/70 mb-8 max-w-2xl mx-auto">
            Articles on validation, community-driven growth, and product-market fit.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {sorted.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <article className="rounded-2xl overflow-hidden glass-card hover:shadow-2xl transition-all duration-300">
                  <div className="relative w-full h-48 sm:h-56 md:h-64">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={false}
                    />
                  </div>
                  <div className="p-5">
                    <div className="text-white/60 text-sm mb-2">{formatDate(post.date)}</div>
                    <h2 className="text-white text-xl sm:text-2xl font-bold tracking-tight group-hover:text-purple-200 transition-colors">
                      {post.title}
                    </h2>
                    <div className="mt-3 text-white/70 text-sm inline-flex items-center gap-1">
                      Read article
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 