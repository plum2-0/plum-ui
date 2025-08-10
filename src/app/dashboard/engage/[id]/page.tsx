"use client";

import { useParams, useRouter } from "next/navigation";
import InitiativeDetail from "@/components/agent-dashboard/InitiativeDetail";
import { ArrowLeft } from "lucide-react";

export default function InitiativeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F23] via-[#1A0B2E] to-[#2D1B3D] text-white">
      {/* Floating orbs for ambiance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/agent-dashboard")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span>Dashboard</span>
                <span>/</span>
                <span>Initiative</span>
                <span>/</span>
                <span className="text-white">Edit</span>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-sm">
              Initiative Details
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        <InitiativeDetail initiativeId={id} />
      </main>
    </div>
  );
}