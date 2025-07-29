import NextAuth from "next-auth"
import authConfig from "./auth.config"

// Edge-compatible auth configuration without firebase-admin
// Uses the same config as main auth to ensure consistency
export const authEdge = NextAuth(authConfig)

export const { auth } = authEdge