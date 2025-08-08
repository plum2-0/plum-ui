import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlumSproutLogo } from "@/components/PlumSproutLogo";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-farm-night text-farm-night">
      {/* -------------- HEADER -------------- */}
      {/* ───────────────── NAV BAR ───────────────── */}
      <header className="nav-glass">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <PlumSproutLogo className="w-8 h-8" />

            <span className="hidden sm:inline brand-bg">
              <span
                className="font-heading text-xl md:text-2xl tracking-wider
                 text-brand-gradient hover:glow"
              >
                PlumSprout
              </span>
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-6">
          <Link href="#features" className="nav-link">
            Features
          </Link>
          <Link href="#pricing" className="nav-link">
            Pricing
          </Link>
          <Link href="/auth/signin" className="btn-primary">
            Sign&nbsp;in
          </Link>
        </nav>
      </header>

      {/* -------------- HERO -------------- */}
      <section className="hero-farm flex-1 flex items-center justify-center py-16 lg:py-24">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center px-6">
          {/* TAGLINE + CTA */}
          <div className="text-left">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight text-farm-night drop-shadow">
              Never Miss a Conversation About&nbsp;Your Brand Again
            </h1>
            <p className="font-body text-lg md:text-xl mb-8 max-w-2xl text-farm-soil/80">
              Monitor Reddit conversations in real-time and get instant
              notifications when your brand is&nbsp;mentioned.
            </p>

            <Link href="/auth/signin" className="btn-primary">
              Get Started
            </Link>
          </div>

          {/* DEMO FLOW */}
          <div className="flex justify-center lg:justify-end">
            <div className="card-farm w-full max-w-lg space-y-4">
              {/* Reddit mention */}
              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-sm text-farm-night/70 mb-1">
                  Mention of <span className="font-semibold">Plum</span> on
                  <span className="ml-1 text-orange-600">r/appsumo</span>
                </p>
                <p className="font-medium text-farm-night">
                  “I wish I had a cool way to listen in Reddit threads…”
                </p>
              </div>

              {/* arrow */}
              <div className="flex justify-center">
                <svg
                  className="w-6 h-6 text-farm-mint animate-bounce"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              </div>

              {/* notification */}
              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🍑</span>
                  <span className="text-sm text-farm-night/70">
                    1 new mention of “Plum”
                  </span>
                </p>
                <p className="flex items-center gap-2 mb-2 text-sm text-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  High relevance – potential user looking for a service like
                  Plum
                </p>
                <Link href="#" className="text-sm link-farm">
                  See post
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------- HOW IT WORKS -------------- */}
      <section id="features" className="howit-wrapper mx-6 my-16">
        <h2 className="font-heading text-3xl md:text-4xl text-center mb-12 text-farm-wheat">
          How&nbsp;It&nbsp;Works
        </h2>

        <div className="grid md:grid-cols-3 gap-12 text-center">
          {[
            {
              num: 1,
              title: "Tell us about your Brand",
              blurb:
                "Input personas that resonate with your brand to engage with the community.",
              bg: "step-bg-1",
            },
            {
              num: 2,
              title: "Input Subreddits & Keywords",
              blurb:
                "Specify subreddits and keywords related to your products or services.",
              bg: "step-bg-2",
            },
            {
              num: 3,
              title: "Get Notified & Amplify",
              blurb:
                "Receive instant notifications and jump into the conversation.",
              bg: "step-bg-3",
            },
          ].map((step) => (
            <div key={step.num} className="text-center">
              <div
                className={`${step.bg} w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow`}
              >
                <span className="text-2xl font-heading text-farm-night">
                  {step.num}
                </span>
              </div>
              <h3 className="font-heading text-lg md:text-xl mb-3 text-farm-wheat">
                {step.title}
              </h3>
              <p className="font-body text-sm md:text-base text-farm-sky/90">
                {step.blurb}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------- FOOTER -------------- */}
      <footer className="text-center py-6 font-body text-sm text-farm-soil/70">
        © 2024 Plum.ai – Never miss a conversation about your brand
      </footer>
    </div>
  );
}
