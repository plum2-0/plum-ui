import { Session } from 'next-auth'

export const mockSession: Session = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    image: 'https://example.com/avatar.jpg',
    provider: 'google',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
}

export const mockUnauthenticatedSession = null

export function mockAuthState(isAuthenticated: boolean = false) {
  const mockUseSession = isAuthenticated
    ? { data: mockSession, status: 'authenticated' as const }
    : { data: null, status: 'unauthenticated' as const }

  jest.mock('next-auth/react', () => ({
    useSession: jest.fn(() => mockUseSession),
    signIn: jest.fn(),
    signOut: jest.fn(),
  }))
}

export function mockNextAuthRequest(session: Session | null = null) {
  return {
    auth: session,
    nextUrl: {
      pathname: '/test',
      search: '',
      hash: '',
    },
    url: 'http://localhost:3000/test',
  }
}