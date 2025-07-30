"use client";

import React, { useState, useEffect } from 'react';

interface LLMResponsePanelProps {
  response: string;
  isEditMode: boolean;
  onSave: (editedResponse: string) => void;
  onCancel: () => void;
}

const MAX_REDDIT_COMMENT_LENGTH = 10000;

export function LLMResponsePanel({ 
  response, 
  isEditMode, 
  onSave, 
  onCancel 
}: LLMResponsePanelProps) {
  const [editedResponse, setEditedResponse] = useState(response);

  useEffect(() => {
    setEditedResponse(response);
  }, [response]);

  const handleSave = () => {
    if (editedResponse.trim() && editedResponse !== response) {
      onSave(editedResponse.trim());
    }
  };

  const characterCount = editedResponse.length;
  const isOverLimit = characterCount > MAX_REDDIT_COMMENT_LENGTH;

  if (!isEditMode) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">AI Generated Response</h3>
        </div>
        <p className="text-gray-800 whitespace-pre-wrap">{response}</p>
        <div className="mt-2 text-xs text-gray-500">
          {characterCount}/{MAX_REDDIT_COMMENT_LENGTH} characters
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Edit Response</h3>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isOverLimit || editedResponse.trim() === response}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
      <textarea
        value={editedResponse}
        onChange={(e) => setEditedResponse(e.target.value)}
        className={`w-full h-32 p-2 border rounded-md resize-vertical ${
          isOverLimit ? 'border-red-500' : 'border-gray-300'
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        placeholder="Edit the AI response..."
      />
      <div className={`mt-2 text-xs ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>
        {characterCount}/{MAX_REDDIT_COMMENT_LENGTH} characters
        {isOverLimit && ' - Exceeds Reddit limit!'}
      </div>
    </div>
  );
}