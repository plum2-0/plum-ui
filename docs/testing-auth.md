# Testing NextAuth Implementation

This guide covers multiple ways to test the NextAuth implementation in Plum 2.0.

## 1. Manual Testing (Frontend)

The simplest way to test is through the UI:

```bash
npm run dev
```

1. Visit http://localhost:3000
2. Click "Get Started"
3. Sign in with Google
4. Verify redirect to /onboarding
5. Check user info is displayed
6. Test sign out functionality

## 2. Unit Tests

Run unit tests for auth components:

```bash
# Run all tests
npm test

# Run with coverage
npm test:coverage

# Watch mode for development
npm test:watch
```

Tests cover:
- SignOutButton component
- Sign-in page component
- Middleware logic
- API route exports

## 3. E2E Tests (Playwright)

Run end-to-end tests:

```bash
# Run E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui
```

E2E tests verify:
- Protected route redirects
- Sign-in page rendering
- Error handling
- Navigation flows

## 4. Programmatic Configuration Check

Verify your auth configuration:

```bash
npx tsx src/__tests__/helpers/verify-auth-config.ts
```

This checks:
- All required environment variables
- NextAuth configuration
- Firebase setup
- Security settings

## 5. API Testing with cURL

Test auth endpoints directly:

```bash
# Get CSRF token
curl -c cookies.txt http://localhost:3000/api/auth/csrf

# Check session
curl -b cookies.txt http://localhost:3000/api/auth/session

# Get providers
curl http://localhost:3000/api/auth/providers
```

## 6. Testing OAuth Flow

For full OAuth testing, you need:

1. **Development Mode**: Use your actual Google account
2. **Test Mode**: Create test OAuth app in Google Console
3. **Mock Mode**: Use NextAuth's mock provider

### Adding Mock Provider for Tests

```typescript
// In auth.ts for test environment
providers: [
  process.env.NODE_ENV === 'test' 
    ? Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
        },
        async authorize(credentials) {
          return { 
            id: '1', 
            email: credentials?.email,
            name: 'Test User' 
          }
        }
      })
    : Google({ /* ... */ })
]
```

## 7. Debug Authentication Issues

Enable debug mode in `.env.local`:

```bash
# Add to .env.local
DEBUG=* 
```

Check NextAuth debug logs in console.

## Common Test Scenarios

1. **New User Flow**
   - Clear cookies/session
   - Sign in with Google
   - Verify user creation in Firebase

2. **Returning User**
   - Sign in again
   - Check session persistence
   - Verify user data

3. **Error Handling**
   - Test with invalid callbacks
   - Network failures
   - OAuth errors

4. **Protected Routes**
   - Access /onboarding without auth
   - Verify redirect to signin
   - Check callback URL preservation

## Troubleshooting

- **"NEXTAUTH_URL is not set"**: Ensure .env.local is loaded
- **OAuth redirect mismatch**: Check Google Console redirect URIs
- **Firebase errors**: Verify service account permissions
- **Session not persisting**: Check NEXTAUTH_SECRET is set