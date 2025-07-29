import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should redirect to sign-in when accessing protected route', async ({ page }) => {
    // Try to access protected route
    await page.goto('/onboarding')
    
    // Should be redirected to sign-in
    await expect(page).toHaveURL(/\/auth\/signin/)
    
    // Should preserve the callback URL
    const url = page.url()
    expect(url).toContain('callbackUrl=%2Fonboarding')
  })

  test('should display sign-in page correctly', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Check page elements
    await expect(page.getByText('Welcome to Plum')).toBeVisible()
    await expect(page.getByText('Sign in to start monitoring Reddit conversations')).toBeVisible()
    
    // Check Google button
    const googleButton = page.getByRole('button', { name: /Continue with Google/i })
    await expect(googleButton).toBeVisible()
    await expect(googleButton).toBeEnabled()
    
    // Check disabled providers
    const githubButton = page.getByRole('button', { name: /Continue with GitHub/i })
    const microsoftButton = page.getByRole('button', { name: /Continue with Microsoft/i })
    await expect(githubButton).toBeDisabled()
    await expect(microsoftButton).toBeDisabled()
  })

  test('should handle sign-in errors gracefully', async ({ page }) => {
    // Navigate to sign-in with error
    await page.goto('/auth/signin?error=OAuthSignin')
    
    // Check error message
    await expect(page.getByText('Error signing in with OAuth provider')).toBeVisible()
  })

  test('homepage should show Get Started button when not authenticated', async ({ page }) => {
    await page.goto('/')
    
    // Check for Get Started button
    const getStartedButton = page.getByRole('link', { name: /Get Started/i })
    await expect(getStartedButton).toBeVisible()
    
    // Click should navigate to sign-in
    await getStartedButton.click()
    await expect(page).toHaveURL('/auth/signin')
  })

  // Note: Testing actual OAuth flow requires mocking or test accounts
  // This is typically done in integration tests with test providers
  test.skip('should complete Google OAuth flow', async ({ page }) => {
    // This would require:
    // 1. Test Google account credentials
    // 2. Handling OAuth redirects
    // 3. Mocking or using a test OAuth provider
  })
})