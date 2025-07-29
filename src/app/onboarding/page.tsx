import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SignOutButton } from "@/components/SignOutButton"
import { PlumLogo } from "@/components/PlumLogo"

export default async function OnboardingPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700">
      <header className="p-6 flex justify-between items-center">
        <PlumLogo />
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {session.user.image && (
              <img 
                src={session.user.image} 
                alt={session.user.name || 'User'} 
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-white">{session.user.name}</span>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to Plum!</h1>
          <p className="text-xl text-purple-100 mb-12">
            Let's set up your Reddit monitoring in just a few steps.
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold">
                  1
                </div>
                <div className="flex-1 h-1 bg-white/30 mx-2"></div>
              </div>
              <p className="text-white mt-2">Account Created</p>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center text-white/60 font-bold">
                  2
                </div>
                <div className="flex-1 h-1 bg-white/20 mx-2"></div>
              </div>
              <p className="text-white/60 mt-2">Connect Reddit</p>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center text-white/60 font-bold">
                  3
                </div>
                <div className="flex-1 h-1 bg-white/20 mx-2"></div>
              </div>
              <p className="text-white/60 mt-2">Connect Discord</p>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center text-white/60 font-bold">
                  4
                </div>
              </div>
              <p className="text-white/60 mt-2">Configure</p>
            </div>
          </div>

          {/* Current Step Content */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Step 1: Account Created ✓</h2>
            <p className="text-purple-100 mb-6">
              Great! You've successfully created your Plum account using Google.
            </p>
            
            <div className="bg-white/10 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Your Account Details:</h3>
              <div className="space-y-2 text-purple-100">
                <p>Email: {session.user.email}</p>
                <p>Name: {session.user.name}</p>
                <p>Provider: Google</p>
              </div>
            </div>

            <div className="flex justify-between">
              <button 
                className="text-white/70 hover:text-white transition-colors"
                disabled
              >
                ← Previous
              </button>
              <button 
                className="bg-white hover:bg-gray-100 text-purple-600 font-semibold py-3 px-6 rounded-lg transition-colors"
                onClick={() => {
                  // TODO: Navigate to next step
                  console.log('Next step')
                }}
              >
                Continue to Reddit Connection →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}