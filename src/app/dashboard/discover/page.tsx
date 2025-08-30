import DiscoverPageClient from "./client";

// Server component that properly handles Next.js 15 page props
export default async function DiscoverPage() {
  // This is a server component that doesn't use "use client"
  // It simply renders the client component without passing props
  return <DiscoverPageClient />;
}