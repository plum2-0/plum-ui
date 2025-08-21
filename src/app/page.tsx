"use client";

import { redirect } from "next/navigation";
import Link from "next/link";
import { PlumSproutLogo } from "@/components/PlumSproutLogo";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (session?.user) redirect("/dashboard/engage");
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
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3), transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.2), transparent 50%),
            linear-gradient(135deg, #0F0F23 0%, #1A0B2E 25%, #2D1B3D 50%, #1E293B 75%, #0F172A 100%)
          `
        }}
      />
      
      {/* Floating Glass Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-30 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.1) 70%, transparent 100%)',
            filter: 'blur(40px)',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute top-40 right-32 w-96 h-96 rounded-full opacity-25 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.1) 70%, transparent 100%)',
            filter: 'blur(50px)',
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />
        <div 
          className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.05) 70%, transparent 100%)',
            filter: 'blur(30px)',
            animation: 'float 10s ease-in-out infinite'
          }}
        />
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(34, 197, 94, 0.2); }
          50% { box-shadow: 0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(34, 197, 94, 0.4); }
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        .glass-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(30px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .glass-button {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(34, 197, 94, 0.8));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }
        .glass-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 2s infinite;
        }
        .liquid-gradient {
          background: linear-gradient(135deg, 
            rgba(168, 85, 247, 0.9) 0%, 
            rgba(34, 197, 94, 0.9) 50%, 
            rgba(255, 255, 255, 0.9) 100%);
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
            <Link href="#features" className="font-medium text-white/80 hover:text-white transition-all duration-300 hover:drop-shadow-lg">
              Features
            </Link>
            <Link href="#pricing" className="font-medium text-white/80 hover:text-white transition-all duration-300 hover:drop-shadow-lg">
              Pricing
            </Link>
            <Link 
              href="/auth/signin" 
              className="px-6 py-3 rounded-xl font-heading text-lg tracking-wide text-white transition-all duration-300 hover:scale-105 glass-button"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* -------------- HERO -------------- */}
      <section className="flex-1 flex items-center justify-center py-8 lg:py-12 relative z-10">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 items-center px-6">
          {/* TAGLINE + CTA */}
                      <div className="text-left space-y-6">
                          <div className="space-y-4">
                              <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight text-white drop-shadow-2xl tracking-tight">
                  Amplify your <span className="bg-gradient-to-r from-purple-400 via-green-400 to-white bg-clip-text text-transparent animate-pulse font-extrabold">Brand's Presence</span>
                </h1>
                              <p className="font-body font-medium text-lg md:text-xl max-w-2xl text-white/90 leading-relaxed tracking-wide">
                  Multiply your marketing team with PlumSprout AI to listen and sprout your Brand's Community
                </p>
            </div>

                          <Link 
                href="/auth/signin" 
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-heading font-semibold text-xl tracking-wide text-white transition-all duration-500 hover:scale-105 glass-button group"
                style={{ animation: 'glow 3s ease-in-out infinite' }}
              >
                <span>Get Started</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* DEMO FLOW */}
          <div className="flex justify-center lg:justify-end">
            <div className="glass-card rounded-3xl p-6 w-full max-w-lg space-y-4 relative">
              {/* Floating particles inside card */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 right-6 w-2 h-2 bg-purple-400 rounded-full opacity-60 animate-ping"></div>
                <div className="absolute bottom-8 left-8 w-1 h-1 bg-green-400 rounded-full opacity-40 animate-pulse"></div>
              </div>

              {/* Reddit mention */}
              <div className="glass-card rounded-2xl p-4 space-y-2">
                <p className="text-sm text-white/70">
                  Mention of <span className="font-semibold text-purple-300">Plum</span> on
                  <span className="ml-1 text-orange-400">r/appsumo</span>
                </p>
                <p className="font-medium text-white leading-relaxed">
                  "I wish I had a cool way to listen in Reddit threads…"
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

              {/* Notification */}
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🍑</span>
                  <span className="text-sm text-white/80">
                    1 new mention of "Plum"
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-300">
                    High relevance – potential user looking for a service like Plum
                  </span>
                </div>
                <Link 
                  href="#" 
                  className="inline-flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200 transition-colors group"
                >
                  <span>See post</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
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

          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              {
                num: 1,
                emoji: "🚀",
                title: "Setup",
                blurb: "Tell us about your brand and we'll start listening across all platforms instantly.",
                gradient: "from-purple-500 to-purple-600",
                glowColor: "rgba(168, 85, 247, 0.5)"
              },
              {
                num: 2,
                emoji: "🔍",
                title: "Discover",
                blurb: "AI finds relevant conversations, recommends opportunities, and drafts on-brand responses.",
                gradient: "from-green-500 to-emerald-500",
                glowColor: "rgba(34, 197, 94, 0.5)"
              },
              {
                num: 3,
                emoji: "📈",
                title: "Engage",
                blurb: "Publish approved posts across your social channels and drive community growth.",
                gradient: "from-orange-500 to-red-500",
                glowColor: "rgba(249, 115, 22, 0.5)"
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
                  <span className="text-2xl">
                    {step.emoji}
                  </span>
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
          © 2024 Plum.ai – Never miss a conversation about your brand
        </div>
      </footer>
    </div>
  );
}
