import Link from "next/link";
import { PlumLogo } from "@/components/PlumLogo";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  // Check if user is authenticated
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/signin");
  }
  
  // Get project ID from cookie
  const cookieStore = await cookies();
  const projectId = cookieStore.get("project_id")?.value;
  
  if (!projectId) {
    redirect("/onboarding");
  }
  
  // Get onboarding state to check if setup is complete
  let projectName = "Your Project";
  let isConfigComplete = false;
  
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/onboarding/state`, {
      headers: {
        cookie: cookieStore.toString(),
      },
    });
    
    if (response.ok) {
      const state = await response.json();
      projectName = state.projectName || "Your Project";
      isConfigComplete = state.hasCompleteConfig || false;
      
      // If config is not complete, redirect to appropriate onboarding step
      if (!isConfigComplete && state.redirectTo && state.redirectTo !== "/dashboard") {
        redirect(state.redirectTo);
      }
    }
  } catch (error) {
    console.error("Error fetching onboarding state:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="p-6 bg-white/10 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PlumLogo />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm">Welcome, {session.user.name || session.user.email}</span>
            <Link 
              href="/api/auth/signout"
              className="text-white/60 hover:text-white text-sm"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              {projectName} Dashboard
            </h1>
            <p className="text-purple-200 text-lg mb-8">
              Manage your Reddit monitoring and engagement
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Reddit Post Review */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Reddit Post Review
                  </h3>
                  <p className="text-purple-200 text-sm mb-4">
                    Review AI-matched Reddit posts and take actions on responses
                  </p>
                  <Link
                    href={`/projects/${projectId}/review`}
                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Review Posts
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Source Configuration */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Source Configuration
                  </h3>
                  <p className="text-purple-200 text-sm mb-4">
                    Configure subreddits, topics, and AI prompts
                  </p>
                  <Link
                    href="/onboarding/configure"
                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Configure
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Analytics (Coming Soon) */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 opacity-60">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Analytics Dashboard
                  </h3>
                  <p className="text-purple-200 text-sm mb-4">
                    Track engagement metrics and response effectiveness
                  </p>
                  <span className="inline-flex items-center gap-2 text-gray-400 font-medium">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>

            {/* Response Templates (Coming Soon) */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 opacity-60">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Response Templates
                  </h3>
                  <p className="text-purple-200 text-sm mb-4">
                    Save and reuse common response patterns
                  </p>
                  <span className="inline-flex items-center gap-2 text-gray-400 font-medium">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">15</div>
              <div className="text-purple-200 text-sm">Pending Reviews</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">47</div>
              <div className="text-purple-200 text-sm">Posts Replied</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">89%</div>
              <div className="text-purple-200 text-sm">Response Rate</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}