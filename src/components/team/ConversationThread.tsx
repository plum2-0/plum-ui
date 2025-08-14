"use client";

import { useState } from "react";
import { RedditConvo, RedditThreadNode } from "@/types/agent";
import { useRedditThread } from "@/hooks/api/useAgentQueries";

interface ConversationThreadProps {
  redditConvo: RedditConvo;
  onExpand?: (conversationId: string) => void;
  onCollapse?: (conversationId: string) => void;
}

export default function ConversationThread({ 
  redditConvo, 
  onExpand, 
  onCollapse 
}: ConversationThreadProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [fullThread, setFullThread] = useState<RedditThreadNode | null>(null);
  
  const { parentPost, parentReply, actions } = redditConvo;
  const hasMoreReplies = actions.length > 0;

  const handleToggleExpand = async () => {
    if (!isExpanded && !fullThread && hasMoreReplies) {
      setLoadingThread(true);
      try {
        // In a real implementation, fetch full thread from Reddit API
        // For now, we'll just simulate the structure
        const mockThread: RedditThreadNode = {
          id: parentReply.id,
          author: parentReply.author,
          body: parentReply.content,
          score: parentReply.upvotes || 0,
          created_utc: new Date(parentReply.createdAt).getTime() / 1000,
          permalink: parentReply.permalink,
          replies: actions.map((action, idx) => ({
            id: `reply-${idx}`,
            author: action.userPost.author,
            body: action.userPost.content,
            score: 0,
            created_utc: Date.now() / 1000,
            permalink: "",
            replies: action.agentReply ? [{
              id: `agent-reply-${idx}`,
              author: parentReply.author,
              body: action.agentReply.content,
              score: 0,
              created_utc: Date.now() / 1000,
              permalink: "",
              replies: []
            }] : []
          }))
        };
        setFullThread(mockThread);
      } catch (error) {
        console.error("Failed to load thread:", error);
      } finally {
        setLoadingThread(false);
      }
    }
    
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      onExpand?.(parentPost.id);
    } else {
      onCollapse?.(parentPost.id);
    }
  };

  const renderThread = (node: RedditThreadNode, depth: number = 0) => {
    const indent = depth * 24;
    
    return (
      <div key={node.id} style={{ marginLeft: `${indent}px` }}>
        <div 
          className="rounded-lg p-3 mb-2 transition-all"
          style={{
            background: depth % 2 === 0 
              ? "rgba(255, 255, 255, 0.03)" 
              : "rgba(255, 255, 255, 0.05)",
            borderLeft: `2px solid rgba(255, 79, 0, ${Math.max(0.2, 0.6 - depth * 0.1)})`,
          }}
        >
          <div className="flex items-start gap-2 mb-2">
            <span className="text-orange-400 text-xs font-body font-semibold">
              u/{node.author}
            </span>
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/40 text-xs font-body">
              {node.score} points
            </span>
          </div>
          <p className="text-white/80 text-sm font-body whitespace-pre-wrap">
            {node.body}
          </p>
        </div>
        
        {node.replies.map((reply) => renderThread(reply, depth + 1))}
      </div>
    );
  };

  return (
    <div 
      className="rounded-2xl p-5 mb-4 transition-all duration-300"
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderLeft: "3px solid #FF4500",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
      }}
    >
      {/* Parent Post */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-heading font-semibold text-sm">
                {parentPost.content.substring(0, 100)}...
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-orange-400 text-xs font-body">
                  r/{parentPost.platform}
                </span>
                <span className="text-white/40 text-xs">•</span>
                <span className="text-white/50 text-xs font-body">
                  u/{parentPost.author}
                </span>
                <span className="text-white/40 text-xs">•</span>
                <span className="text-white/50 text-xs font-body">
                  {parentPost.upvotes} upvotes
                </span>
              </div>
            </div>
          </div>
          
          <a
            href={parentPost.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Agent's Initial Reply */}
      <div 
        className="ml-6 p-3 rounded-lg mb-3"
        style={{
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(34, 197, 94, 0.05))",
          borderLeft: "2px solid rgba(34, 197, 94, 0.5)",
        }}
      >
        <div className="flex items-start gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-green-500 shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-green-400 text-xs font-body font-semibold">
                {parentReply.author}
              </span>
              <span className="text-white/40 text-xs">•</span>
              <span className="text-white/40 text-xs font-body">
                {parentReply.upvotes} upvotes
              </span>
            </div>
            <p className="text-white/80 text-sm font-body">
              {parentReply.content}
            </p>
          </div>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      {hasMoreReplies && (
        <button
          onClick={handleToggleExpand}
          disabled={loadingThread}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-body transition-all ml-6"
        >
          {loadingThread ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Loading thread...
            </>
          ) : (
            <>
              <svg 
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {isExpanded ? 'Hide' : 'Show'} {actions.length} more {actions.length === 1 ? 'reply' : 'replies'}
            </>
          )}
        </button>
      )}

      {/* Expanded Thread */}
      {isExpanded && fullThread && (
        <div className="mt-4 ml-6 animate-fade-in">
          {fullThread.replies.map((reply) => renderThread(reply, 0))}
        </div>
      )}
    </div>
  );
}