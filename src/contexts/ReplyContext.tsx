"use client";

import React, { createContext, useContext, ReactNode, useCallback } from "react";

interface ReplyContextType {
  onReplySuccess?: () => void;
  registerReplySuccessHandler: (handler: () => void) => void;
}

const ReplyContext = createContext<ReplyContextType | undefined>(undefined);

interface ReplyProviderProps {
  children: ReactNode;
  onReplySuccess?: () => void;
}

export function ReplyProvider({ children, onReplySuccess }: ReplyProviderProps) {
  const registerReplySuccessHandler = useCallback((handler: () => void) => {
    // This allows child components to trigger the success handler
    if (onReplySuccess) {
      onReplySuccess();
    }
    handler();
  }, [onReplySuccess]);

  return (
    <ReplyContext.Provider value={{ onReplySuccess, registerReplySuccessHandler }}>
      {children}
    </ReplyContext.Provider>
  );
}

export function useReply() {
  const context = useContext(ReplyContext);
  if (context === undefined) {
    throw new Error("useReply must be used within a ReplyProvider");
  }
  return context;
}