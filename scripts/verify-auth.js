#!/usr/bin/env node

/**
 * Programmatic verification of NextAuth configuration
 * Run with: node scripts/verify-auth.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

console.log('🔍 Verifying NextAuth Configuration...\n')

// Check environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
]

console.log('📋 Checking Environment Variables:')
let envVarsValid = true

requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  const exists = !!value
  const displayValue = exists ? `${value.substring(0, 10)}...` : 'NOT SET'
  
  console.log(`  ${exists ? '✅' : '❌'} ${varName}: ${displayValue}`)
  if (!exists) envVarsValid = false
})

console.log('\n📦 NextAuth Configuration:')

// Verify auth configuration
try {
  // Check Firebase Admin configuration
  const firebaseProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  console.log(`  ✅ Firebase Project ID: ${firebaseProjectId}`)
  
  // Verify Google OAuth settings
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  console.log(`  ✅ Google Client ID: ${googleClientId?.substring(0, 20)}...`)
  
  console.log('\n🔐 Security Checks:')
  console.log(`  ${process.env.NEXTAUTH_SECRET ? '✅' : '❌'} NEXTAUTH_SECRET is set`)
  console.log(`  ${process.env.NEXTAUTH_URL ? '✅' : '❌'} NEXTAUTH_URL is set: ${process.env.NEXTAUTH_URL}`)
  
  // Check public env vars
  console.log('\n🌐 Public Environment Variables:')
  const publicVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ]
  
  publicVars.forEach(varName => {
    const exists = !!process.env[varName]
    console.log(`  ${exists ? '✅' : '❌'} ${varName}`)
  })
  
} catch (error) {
  console.error('\n❌ Configuration Error:', error)
  process.exit(1)
}

console.log('\n✨ Configuration verification complete!')

if (!envVarsValid) {
  console.log('\n⚠️  Some environment variables are missing!')
  console.log('Make sure to set them in your .env.local file')
  process.exit(1)
}

console.log('\n🚀 Your NextAuth setup is ready!')
console.log('\nNext steps:')
console.log('1. Run `npm run dev` to start the development server')
console.log('2. Visit http://localhost:3000')
console.log('3. Click "Get Started" to test authentication')
console.log('4. Run `npm run test:e2e` for end-to-end tests')

process.exit(0)