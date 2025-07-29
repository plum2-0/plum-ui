import { render, screen, fireEvent } from '@testing-library/react'
import { signOut } from 'next-auth/react'
import { SignOutButton } from '@/components/SignOutButton'

jest.mock('next-auth/react')

describe('SignOutButton', () => {
  it('renders sign out button', () => {
    render(<SignOutButton />)
    const button = screen.getByText('Sign Out')
    expect(button).toBeInTheDocument()
  })

  it('calls signOut when clicked', () => {
    const mockSignOut = signOut as jest.MockedFunction<typeof signOut>
    
    render(<SignOutButton />)
    const button = screen.getByText('Sign Out')
    
    fireEvent.click(button)
    
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/' })
  })

  it('has correct styling', () => {
    render(<SignOutButton />)
    const button = screen.getByText('Sign Out')
    
    expect(button).toHaveClass('text-white/80', 'hover:text-white', 'transition-colors', 'text-sm')
  })
})