"use client";

import { redirect } from "next/navigation";
import Link from "next/link";
import { PlumSproutLogo } from "@/components/PlumSproutLogo";
import { TruthMeter } from "@/components/TruthMeter";
import { DebtClockCounters } from "@/components/DebtClockCounter";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (session?.user) redirect("/dashboard/discover");
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background with Liquid Glass Effect */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.3), transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3), transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(249, 115, 22, 0.2), transparent 50%),
            linear-gradient(135deg, #000000 0%, #1A0B2E 25%, #2D1B3D 50%, #1E293B 75%, #000000 100%)
          `,
        }}
      />

      {/* Floating Glass Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-30 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.1) 70%, transparent 100%)",
            filter: "blur(40px)",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-40 right-32 w-96 h-96 rounded-full opacity-25 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.1) 70%, transparent 100%)",
            filter: "blur(50px)",
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.05) 70%, transparent 100%)",
            filter: "blur(30px)",
            animation: "float 10s ease-in-out infinite",
          }}
        />
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translateY(10px) rotate(240deg);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.3),
              0 0 40px rgba(34, 197, 94, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.5),
              0 0 60px rgba(34, 197, 94, 0.4);
          }
        }
        @keyframes death-pulse {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.1) rotate(5deg);
            opacity: 1;
          }
        }
        .death-animation {
          animation: death-pulse 2s ease-in-out infinite;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        .glass-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(30px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .glass-button {
          background: linear-gradient(
            135deg,
            rgba(168, 85, 247, 0.8),
            rgba(34, 197, 94, 0.8)
          );
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }
        .glass-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 2s infinite;
        }
        .liquid-gradient {
          background: linear-gradient(
            135deg,
            rgba(168, 85, 247, 0.9) 0%,
            rgba(34, 197, 94, 0.9) 50%,
            rgba(255, 255, 255, 0.9) 100%
          );
        }
      `}</style>

      {/* -------------- HEADER -------------- */}
      <header className="glass-header p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl glass-card">
              <PlumSproutLogo className="w-8 h-8" />
            </div>

            <span className="hidden sm:inline">
              <span className="font-heading text-xl md:text-2xl tracking-wider text-white drop-shadow-lg">
                PlumSprout
              </span>
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href="#truth"
              className="font-medium text-white/80 hover:text-white transition-all duration-300 hover:drop-shadow-lg"
            >
              See Kill List
            </Link>
            <Link
              href="#demo"
              className="font-medium text-white/80 hover:text-white transition-all duration-300 hover:drop-shadow-lg"
            >
              Watch Demo
            </Link>
            <Link
              href="/auth/signin"
              className="px-6 py-3 rounded-xl font-heading text-lg tracking-wide text-white transition-all duration-300 hover:scale-105 glass-button bg-gradient-to-r from-red-500 to-orange-500"
            >
              Get The Truth
            </Link>
          </nav>
        </div>
      </header>

      {/* -------------- HERO -------------- */}
      <section className="flex-1 flex flex-col items-center justify-center py-8 lg:py-12 relative z-10">
        <div className="w-full max-w-7xl px-6">
          {/* Main Grid */}
          <div className="grid lg:grid-cols-2 gap-8 items-center mb-12">
            {/* TAGLINE + CTA */}
            <div className="text-left space-y-6">
              <div className="space-y-4">
                <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight text-white drop-shadow-2xl tracking-tight">
                  Stop Building{" "}
                  <span className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent font-extrabold">
                    Something Nobody Wants
                  </span>
                </h1>
                <p className="font-body font-medium text-lg md:text-xl max-w-2xl text-white/90 leading-relaxed tracking-wide">
                  Validate ideas & growth hack on Reddit with AI. Join 500+
                  founders who validate in days, not months.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                  <span className="flex items-center gap-1">
                    <span className="text-red-400">⚠️</span> 90% of startups
                    fail
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-green-400">✓</span> Don't be one of
                    them
                  </span>
                </div>
              </div>

              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-heading font-semibold text-xl tracking-wide text-white transition-all duration-500 hover:scale-105 glass-button group bg-gradient-to-r from-green-500 to-emerald-500"
                style={{ animation: "glow 3s ease-in-out infinite" }}
              >
                <span>Start Validating - Free</span>
                <svg
                  className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>

            {/* DEMO FLOW */}
            <div className="flex justify-center lg:justify-end" id="demo">
              <div className="glass-card rounded-3xl p-6 w-full max-w-lg space-y-4 relative">
                {/* Floating particles inside card */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 right-6 w-2 h-2 bg-purple-400 rounded-full opacity-60 animate-ping"></div>
                  <div className="absolute bottom-8 left-8 w-1 h-1 bg-green-400 rounded-full opacity-40 animate-pulse"></div>
                </div>

                {/* Idea Input */}
                <div className="glass-card rounded-2xl p-4 space-y-2">
                  <p className="text-sm text-white/70">
                    Your idea:{" "}
                    <span className="font-semibold text-purple-300">
                      AI Writing Assistant
                    </span>
                  </p>
                  <p className="font-medium text-white leading-relaxed">
                    "I want to build an AI tool that helps with writing..."
                  </p>
                </div>

                {/* Animated arrow */}
                <div className="flex justify-center py-2">
                  <div className="p-3 rounded-full glass-card">
                    <svg
                      className="w-6 h-6 text-green-400 animate-bounce"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                  </div>
                </div>

                {/* Validation Result */}
                <div className="glass-card rounded-2xl p-4 space-y-3">
                  <TruthMeter score={15} />
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex items-center gap-3 text-sm mb-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-300">
                        "Another AI writing tool? We need human connection, not
                        more AI"
                      </span>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <p className="text-xs text-green-400 font-semibold mb-1">
                        💡 PIVOT SUGGESTION:
                      </p>
                      <p className="text-sm text-white">
                        "Writing accountability partners"
                      </p>
                      <p className="text-xs text-green-300 mt-1">
                        🔥 847 people actively looking for this!
                      </p>
                    </div>
                  </div>
                  <Link
                    href="#"
                    className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors group"
                  >
                    <span>Deploy agents to engage</span>
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Debt Clock Style Counters - Full Width Row */}
          <div className="mt-12">
            <DebtClockCounters />
          </div>
        </div>
      </section>

      <section className="mx-6 my-8 relative z-10" id="truth">
        <div className="glass-card rounded-3xl px-4 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full mb-4">
              <span className="text-2xl death-animation">💀</span>
              <span className="text-sm font-bold text-red-400 uppercase tracking-wider">
                The Kill List
              </span>
            </div>
            <h3 className="font-heading text-2xl font-bold text-white">
              Built by ex-YC founders (Rejected) who killed 3 startups before
              finding gold
            </h3>
            <p className="text-white/70 mt-2">
              We learned the hard way so you don't have to
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card rounded-xl p-4">
              <p className="text-white/90 italic mb-3">
                "I was building an AI journal for 4 months. PlumSprout showed 0
                demand. Pivoted to habit tracking. Now at $12K MRR."
              </p>
              <p className="text-sm text-white/60">- Sarah K., Founder</p>
            </div>

            <div className="glass-card rounded-xl p-4">
              <p className="text-white/90 italic mb-3">
                "Saved me from wasting $50K on a food delivery app nobody asked
                for. Found a real problem instead."
              </p>
              <p className="text-sm text-white/60">
                - Mike T., Serial Entrepreneur
              </p>
            </div>

            <div className="glass-card rounded-xl p-4">
              <p className="text-white/90 italic mb-3">
                "Found 847 people begging for my solution in r/entrepreneur.
                Best validation tool ever."
              </p>
              <p className="text-sm text-white/60">- Alex R., SaaS Founder</p>
            </div>
          </div>

          <div className="flex justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white">2.3M</div>
              <div className="text-sm text-white/60">Reddit posts daily</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-400">347</div>
              <div className="text-sm text-white/60">Bad ideas killed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">89</div>
              <div className="text-sm text-white/60">Successful pivots</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">$4.2M</div>
              <div className="text-sm text-white/60">Money saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------- HOW IT WORKS -------------- */}
      <section id="features" className="mx-6 my-6 relative z-10">
        <div className="glass-card rounded-3xl px-4 lg:px-8 py-8">
          <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-extrabold text-center mb-8 text-white tracking-tight">
            How It Works
          </h2>
          <p className="text-center text-white/70 mb-8 max-w-2xl mx-auto">
            Stop guessing. Start knowing. Validate your idea in 3 simple steps.
          </p>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              {
                num: 1,
                emoji: "🎯",
                title: "Drop Your Idea",
                blurb:
                  "Feed us your concept. We scan 10,000+ subreddits for real problems and demand signals.",
                gradient: "from-purple-500 to-purple-600",
                glowColor: "rgba(168, 85, 247, 0.5)",
              },
              {
                num: 2,
                emoji: "💀",
                title: "Get The Truth",
                blurb:
                  "See the brutal reality. Demand score in 24 hours. Kill it or scale it decision.",
                gradient: "from-red-500 to-orange-500",
                glowColor: "rgba(239, 68, 68, 0.5)",
              },
              {
                num: 3,
                emoji: "🚀",
                title: "Growth Hack Winners",
                blurb:
                  "Found gold? Deploy AI agents to engage prospects and convert interest into customers.",
                gradient: "from-green-500 to-emerald-500",
                glowColor: "rgba(34, 197, 94, 0.5)",
              },
            ].map((step) => (
              <div key={step.num} className="text-center group">
                <h3 className="font-heading text-lg md:text-xl font-bold mb-4 text-white group-hover:text-purple-200 transition-colors tracking-wide uppercase">
                  {step.title}
                </h3>
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-br ${step.gradient} shadow-2xl transition-all duration-500 group-hover:scale-110 glass-card`}
                  style={{
                    boxShadow: `0 0 20px ${step.glowColor}, 0 8px 24px rgba(0, 0, 0, 0.3)`,
                  }}
                >
                  <span className="text-2xl">{step.emoji}</span>
                </div>
                <p className="font-body text-sm md:text-base text-white/90 leading-relaxed font-medium tracking-wide">
                  {step.blurb}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------- FOOTER -------------- */}
      <footer className="text-center py-4 font-body text-sm text-white/60 relative z-10">
        <div className="glass-card inline-block px-6 py-3 rounded-full">
          © 2025 PlumSprout – Stop building stuff nobody wants
        </div>
      </footer>
    </div>
  );
}
