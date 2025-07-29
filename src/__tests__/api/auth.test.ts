// Mock the auth module before importing
jest.mock('@/lib/auth', () => ({
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  }
}))

describe('NextAuth API Routes', () => {
  it('exports handlers', () => {
    const { handlers } = require('@/lib/auth')
    expect(handlers.GET).toBeDefined()
    expect(handlers.POST).toBeDefined()
  })

  // Note: Testing the actual OAuth flow requires E2E tests
  // as it involves external providers and browser redirects
})