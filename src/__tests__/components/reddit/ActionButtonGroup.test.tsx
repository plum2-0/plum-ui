import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionButtonGroup } from '@/components/reddit/ActionButtonGroup';

describe('ActionButtonGroup', () => {
  const mockOnAction = jest.fn();

  beforeEach(() => {
    mockOnAction.mockClear();
  });

  it('renders all action buttons', () => {
    render(
      <ActionButtonGroup 
        currentAction="pending" 
        onAction={mockOnAction} 
      />
    );

    expect(screen.getByText('REPLY')).toBeInTheDocument();
    expect(screen.getByText('EDIT')).toBeInTheDocument();
    expect(screen.getByText('IGNORE')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('highlights the current action button', () => {
    render(
      <ActionButtonGroup 
        currentAction="reply" 
        onAction={mockOnAction} 
      />
    );

    const replyButton = screen.getByText('REPLY');
    expect(replyButton).toHaveClass('bg-green-600');
  });

  it('calls onAction when button is clicked', () => {
    render(
      <ActionButtonGroup 
        currentAction="pending" 
        onAction={mockOnAction} 
      />
    );

    fireEvent.click(screen.getByText('REPLY'));
    expect(mockOnAction).toHaveBeenCalledWith('reply');

    fireEvent.click(screen.getByText('IGNORE'));
    expect(mockOnAction).toHaveBeenCalledWith('ignore');
  });

  it('disables buttons when isLoading is true', () => {
    render(
      <ActionButtonGroup 
        currentAction="pending" 
        onAction={mockOnAction}
        isLoading={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});