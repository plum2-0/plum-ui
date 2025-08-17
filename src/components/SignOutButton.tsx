'use client'

import { signOut } from "next-auth/react"
import { clearRedditAuthCache } from "@/lib/verify-reddit"

export function SignOutButton() {
  const handleSignOut = () => {
    // Clear Reddit auth cache from sessionStorage
    clearRedditAuthCache();
    // Clear any other session storage items
    sessionStorage.clear();
    // Sign out
    signOut({ callbackUrl: '/' });
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-white/80 hover:text-white transition-colors text-sm"
    >
      Sign Out
    </button>
  )
}