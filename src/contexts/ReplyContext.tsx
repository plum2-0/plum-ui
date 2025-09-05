"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface ReplyContextType {
  onReplySuccess?: () => void;
}

const ReplyContext = createContext<ReplyContextType | undefined>(undefined);

interface ReplyProviderProps {
  children: ReactNode;
  onReplySuccess?: () => void;
}

export function ReplyProvider({ children, onReplySuccess }: ReplyProviderProps) {
  return (
    <ReplyContext.Provider value={{ onReplySuccess }}>
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