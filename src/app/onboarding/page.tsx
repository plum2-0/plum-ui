'use client'

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect, useSearchParams } from "next/navigation"
import { SignOutButton } from "@/components/SignOutButton"
import { PlumLogo } from "@/components/PlumLogo"
import { OnboardingNavigationButton } from "@/components/OnboardingNavigationButton"

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const [projectName, setProjectName] = useState('')
  
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user) {
      redirect('/auth/signin')
    }
    
    // Check if redirected from Reddit callback
    const step = searchParams.get('step')
    const redditStatus = searchParams.get('reddit')
    if (step === '2' && redditStatus === 'connected') {
      redirect('/onboarding/reddit?reddit=connected')
    }
    
    // Load existing data from localStorage
    const savedData = localStorage.getItem('onboardingData')
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      setProjectName(parsedData.projectName || '')
    }
  }, [session, status, searchParams])
  
  if (status === 'loading') {
    return <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700" />
  }
  
  if (!session?.user) {
    return null
  }
  
  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value)
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
              <h3 className="text-lg font-semibold text-white mb-2">Enter Your Project Name:</h3>
              <p className="text-purple-100 mb-4">This will help us personalize your monitoring experience.</p>
              <input
                type="text"
                value={projectName}
                onChange={handleProjectNameChange}
                placeholder="e.g., My Awesome SaaS"
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-200 border border-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
                required
              />
            </div>

            <div className="flex justify-between">
              <button 
                className="text-white/70 hover:text-white transition-colors"
                disabled
              >
                ← Previous
              </button>
              <OnboardingNavigationButton projectName={projectName} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}