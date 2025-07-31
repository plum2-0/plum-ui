import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlumLogo } from "@/components/PlumLogo";

export default async function Home() {
  const session = await auth();
  
  // If user is already authenticated, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex flex-col">
      {/* Header with Logo */}
      <header className="p-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <PlumLogo />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        {/* First Half - Hero Section */}
        <div className="min-h-[40vh] flex items-center justify-center mb-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full max-w-7xl">
            {/* Left Side - Tagline and CTA */}
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Never Miss a Conversation About Your Brand Again
              </h1>
              <p className="text-lg md:text-xl text-purple-200 mb-8 max-w-2xl">
                Monitor Reddit conversations in real-time and get instant notifications when your brand is mentioned
              </p>
              <Link
                href="/auth/signin"
                className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 md:py-4 md:px-8 rounded-full text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
            </div>
            
            {/* Right Side - Flow Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="space-y-4">
                  {/* Reddit Mention Card */}
                  <div className="bg-white rounded-lg p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">Mention of Plum on Reddit r/appsumo</span>
                    </div>
                    <p className="text-gray-800 font-medium">"I wish I had a cool way to listen in reddit threads"</p>
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex justify-center">
                    <div className="w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 3l-1.5 1.5L12.5 8H3v2h9.5l-4 3.5L10 15l6-6-6-6z" transform="rotate(90 10 10)"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Plum Notification Card */}
                  <div className="bg-white rounded-lg p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🍑</span>
                      </div>
                      <span className="text-sm text-gray-600">1 new mention of 'Plum' on Reddit</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">High relevance – Potential user looking for a service like Plum</span>
                    </div>
                    <a href="#" className="text-blue-600 text-sm hover:underline">See post</a>
                  </div>
                  
                  {/* Plum Notification */}
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg">
                      <span className="text-white text-sm">🍑</span>
                      <span className="text-sm font-medium">Notification</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second Half - Instructions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 lg:p-12 mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center mb-8 md:mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-purple-600 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <span className="text-xl md:text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Tell us about your Brand</h3>
              <p className="text-sm md:text-base text-purple-200 leading-relaxed">
                Input personas that resonate with your brand to engage with community
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-emerald-600 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <span className="text-xl md:text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Input Subreddits & Keywords</h3>
              <p className="text-sm md:text-base text-purple-200 leading-relaxed">
                Specify which subreddits to monitor and add keywords related to your brand, products, or services
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-indigo-600 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <span className="text-xl md:text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Get Notified and Amplify your Voice</h3>
              <p className="text-sm md:text-base text-purple-200 leading-relaxed">
                Receive instant notifications from Plum when your brand is mentioned and engage with community
              </p>
            </div>
          </div>


        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-purple-300 flex-shrink-0">
        <p className="text-sm md:text-base">&copy; 2024 Plum.ai - Never miss a conversation about your brand</p>
      </footer>
    </div>
  );
}
