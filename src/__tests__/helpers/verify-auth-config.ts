/**
 * Programmatic verification of NextAuth configuration
 * Run with: npx tsx src/__tests__/helpers/verify-auth-config.ts
 */

import { auth } from '@/lib/auth'

async function verifyAuthConfiguration() {
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
  
  try {
    // Verify auth export
    console.log(`  ✅ Auth function exported: ${typeof auth === 'function'}`)
    
    // Check Firebase Admin configuration
    const firebaseProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID
    console.log(`  ✅ Firebase Project ID: ${firebaseProjectId}`)
    
    // Verify Google OAuth settings
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    console.log(`  ✅ Google Client ID: ${googleClientId?.substring(0, 20)}...`)
    
    console.log('\n🔐 Security Checks:')
    console.log(`  ${process.env.NEXTAUTH_SECRET ? '✅' : '❌'} NEXTAUTH_SECRET is set`)
    console.log(`  ${process.env.NEXTAUTH_URL ? '✅' : '❌'} NEXTAUTH_URL is set: ${process.env.NEXTAUTH_URL}`)
    
  } catch (error) {
    console.error('\n❌ Configuration Error:', error)
    return false
  }

  console.log('\n✨ Configuration verification complete!')
  return envVarsValid
}

// Run if executed directly
if (require.main === module) {
  verifyAuthConfiguration()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Verification failed:', error)
      process.exit(1)
    })
}

export { verifyAuthConfiguration }