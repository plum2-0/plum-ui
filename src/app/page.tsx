"use client";

import Image from "next/image";

// Plum Icon Component
const PlumIcon = () => (
  <Image
    src="/plum-logo.png"
    alt="Plum Logo"
    width={120}
    height={40}
    priority
    className="h-10 w-auto"
  />
);

export default function Home() {
  const handleDiscordLogin = () => {
    // TODO: Implement Discord OAuth login
    console.log("Discord login clicked");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex flex-col">
      {/* Header with Logo */}
      <header className="p-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <PlumIcon />
          <span className="text-2xl font-bold text-white">Plum</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        {/* First Half - Hero Section */}
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Never Miss a Conversation About Your Brand Again
          </h1>
          <p className="text-lg md:text-xl text-purple-200 mb-8 max-w-2xl">
            Monitor Reddit conversations in real-time and get instant notifications when your brand is mentioned
          </p>
          <button
            onClick={handleDiscordLogin}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 md:py-4 md:px-8 rounded-full text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="md:w-6 md:h-6">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Get Started with Discord
          </button>
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
              <h3 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Connect Your Discord Account</h3>
              <p className="text-sm md:text-base text-purple-200 leading-relaxed">
                Securely link your Discord account to start receiving notifications about your brand mentions
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
              <h3 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Get Notified & Amplify</h3>
              <p className="text-sm md:text-base text-purple-200 leading-relaxed">
                Receive instant Discord notifications when your brand is mentioned and engage with the community
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
