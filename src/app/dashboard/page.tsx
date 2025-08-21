"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the engage page by default
    router.replace("/dashboard/engage");
  }, [router]);

  return null;
}