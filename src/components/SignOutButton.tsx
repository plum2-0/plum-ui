'use client'

import { signOut } from "next-auth/react"

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-white/80 hover:text-white transition-colors text-sm"
    >
      Sign Out
    </button>
  )
}