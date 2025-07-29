import { render, screen, fireEvent } from '@testing-library/react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import SignInPage from '@/app/auth/signin/page'

jest.mock('next-auth/react')
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}))

describe('SignInPage', () => {
  beforeEach(() => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key) => {
        if (key === 'callbackUrl') return null
        if (key === 'error') return null
        return null
      })
    })
  })

  it('renders sign in page with Google button', () => {
    render(<SignInPage />)
    
    expect(screen.getByText('Welcome to Plum')).toBeInTheDocument()
    expect(screen.getByText('Sign in to start monitoring Reddit conversations')).toBeInTheDocument()
    expect(screen.getByText('Continue with Google')).toBeInTheDocument()
  })

  it('calls signIn with Google provider when button clicked', () => {
    const mockSignIn = signIn as jest.MockedFunction<typeof signIn>
    
    render(<SignInPage />)
    const googleButton = screen.getByText('Continue with Google')
    
    fireEvent.click(googleButton)
    
    expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/onboarding' })
  })

  it('shows disabled GitHub and Microsoft buttons', () => {
    render(<SignInPage />)
    
    const githubButton = screen.getByText('Continue with GitHub')
    const microsoftButton = screen.getByText('Continue with Microsoft')
    
    expect(githubButton).toBeDisabled()
    expect(microsoftButton).toBeDisabled()
  })

  it('displays error message when error param exists', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key) => {
        if (key === 'error') return 'OAuthSignin'
        return null
      })
    })
    
    render(<SignInPage />)
    
    expect(screen.getByText('Error signing in with OAuth provider')).toBeInTheDocument()
  })

  it('uses custom callbackUrl when provided', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key) => {
        if (key === 'callbackUrl') return '/dashboard'
        return null
      })
    })
    
    const mockSignIn = signIn as jest.MockedFunction<typeof signIn>
    
    render(<SignInPage />)
    const googleButton = screen.getByText('Continue with Google')
    
    fireEvent.click(googleButton)
    
    expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/dashboard' })
  })
})