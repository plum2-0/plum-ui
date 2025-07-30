"use client";

import React from 'react';
import { UserAction } from '@/types/reddit';

interface ActionButtonGroupProps {
  currentAction: UserAction;
  onAction: (action: UserAction) => void;
  isLoading?: boolean;
}

export function ActionButtonGroup({ 
  currentAction, 
  onAction, 
  isLoading = false 
}: ActionButtonGroupProps) {
  const actionButtons: Array<{
    action: UserAction;
    label: string;
    color: string;
    hoverColor: string;
  }> = [
    { 
      action: 'reply', 
      label: 'REPLY', 
      color: 'bg-green-600', 
      hoverColor: 'hover:bg-green-700' 
    },
    { 
      action: 'edit', 
      label: 'EDIT', 
      color: 'bg-blue-600', 
      hoverColor: 'hover:bg-blue-700' 
    },
    { 
      action: 'ignore', 
      label: 'IGNORE', 
      color: 'bg-gray-500', 
      hoverColor: 'hover:bg-gray-600' 
    },
    { 
      action: 'pending', 
      label: 'PENDING', 
      color: 'bg-yellow-500', 
      hoverColor: 'hover:bg-yellow-600' 
    },
  ];

  return (
    <div className="flex gap-2 mt-4">
      {actionButtons.map(({ action, label, color, hoverColor }) => (
        <button
          key={action}
          onClick={() => onAction(action)}
          disabled={isLoading}
          className={`
            px-4 py-2 rounded-md text-white font-medium transition-colors
            ${currentAction === action ? `${color} ring-2 ring-offset-2 ring-${color}` : 'bg-gray-400'}
            ${!isLoading && currentAction !== action ? `${hoverColor} hover:text-white` : ''}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}