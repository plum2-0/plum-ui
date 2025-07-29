'use client'

import { useRouter } from 'next/navigation'

interface OnboardingNavigationButtonProps {
  projectName?: string
}

export function OnboardingNavigationButton({ projectName }: OnboardingNavigationButtonProps) {
  const router = useRouter()

  const handleNavigation = () => {
    // Save project name to localStorage if provided
    if (projectName !== undefined) {
      const existingData = localStorage.getItem('onboardingData')
      const onboardingData = existingData ? JSON.parse(existingData) : {}
      
      onboardingData.projectName = projectName
      localStorage.setItem('onboardingData', JSON.stringify(onboardingData))
    }
    
    router.push('/onboarding/reddit')
  }

  return (
    <button 
      className="bg-white hover:bg-gray-100 text-purple-600 font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleNavigation}
      disabled={projectName !== undefined && !projectName.trim()}
    >
      Continue to Reddit Connection →
    </button>
  )
}