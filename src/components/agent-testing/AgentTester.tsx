"use client";

import { useState, useEffect, useCallback } from "react";
import { useBrand } from "@/contexts/BrandContext";
import { useGenerateReply } from "@/hooks/useGenerateReply";
import TestPostCarousel from "./TestPostCarousel";
import GlassPanel from "@/components/ui/GlassPanel";
import type { RedditPostUI } from "@/types/brand";
import { Sparkles, Copy, RefreshCw, Send } from "lucide-react";
import type { Agent } from "@/types/agent";

interface AgentTesterProps {
  agent: Agent | null;
}

export default function AgentTester({ agent }: AgentTesterProps) {
  const { allActionedPosts, isLoading: isBrandLoading } = useBrand();
  const { agentReply, isGenerating } = useGenerateReply();

  const [selectedPost, setSelectedPost] = useState<RedditPostUI | null>(null);
  const [generatedReply, setGeneratedReply] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Reset state when agent changes
  useEffect(() => {
    setSelectedPost(null);
    setGeneratedReply("");
    setErrorMessage("");
  }, [agent?.id]);

  const agentId = agent?.id;

  const handleGenerateReply = useCallback(async () => {
    if (!selectedPost || !agent || !agentId || isBrandLoading) return;

    setErrorMessage("");
    setGeneratedReply("");

    try {
      const { ...postWithoutProspectId } = selectedPost;
      delete (postWithoutProspectId as any).prospect_id;

      const result = await agentReply(agent, postWithoutProspectId);
      setGeneratedReply(result.content);
      setErrorMessage("");
    } catch (error) {
      console.error("Error generating reply:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to generate reply";
      setErrorMessage(errorMsg);
      setGeneratedReply("");
    }
  }, [selectedPost, agent, agentId, isBrandLoading, agentReply]);

  // Auto-generate reply when post is selected
  useEffect(() => {
    if (selectedPost && agentId && !isBrandLoading) {
      handleGenerateReply();
    }
  }, [selectedPost, isBrandLoading, agentId, handleGenerateReply]);

  const handleCopyReply = () => {
    if (generatedReply) {
      navigator.clipboard.writeText(generatedReply);
    }
  };

  if (!agent) {
    return (
      <GlassPanel variant="light" className="p-8 text-center">
        <p className="text-white/60">Please select an agent to begin testing</p>
      </GlassPanel>
    );
  }

  return (
    <div className="space-y-6">
      {/* Post Selection Carousel */}
      <TestPostCarousel
        posts={allActionedPosts}
        onPostSelect={setSelectedPost}
        selectedPostId={selectedPost?.thing_id}
      />

      {/* Reply Generation Section */}
      {selectedPost && (
        <GlassPanel
          variant="dark"
          className="p-6"
          style={{
            boxShadow:
              "inset 0 4px 12px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Generated Reply
            </h3>
            {generatedReply && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyReply}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={handleGenerateReply}
                  disabled={isGenerating}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Regenerate"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-white ${
                      isGenerating ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Reply Content */}
          <div className="min-h-[200px]">
            {isBrandLoading ? (
              <div className="flex items-center justify-center h-[200px] text-white/40">
                <p className="text-center">Loading brand data...</p>
              </div>
            ) : errorMessage ? (
              <div
                className="p-4 rounded-lg"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <svg
                      className="w-5 h-5 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-red-400 font-medium mb-1">
                      Failed to generate reply
                    </p>
                    <p className="text-white/60 text-sm">{errorMessage}</p>
                    <button
                      onClick={handleGenerateReply}
                      disabled={isGenerating}
                      className="mt-3 px-4 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
                      style={{
                        background: "rgba(239, 68, 68, 0.2)",
                        color: "#fca5a5",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            ) : generatedReply ? (
              <div
                className="p-4 rounded-lg text-white/90 whitespace-pre-wrap"
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.03)",
                }}
              >
                {generatedReply}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-white/40">
                <p className="text-center">
                  {isGenerating
                    ? "Generating reply..."
                    : "Click 'Generate Reply' to create a response"}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {generatedReply && (
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
              <button
                className="flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(16, 185, 129, 0.8))",
                  color: "white",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
                }}
              >
                <Send className="w-4 h-4" />
                Post to Reddit
              </button>
              <button
                onClick={() => setGeneratedReply("")}
                className="px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                Clear
              </button>
            </div>
          )}
        </GlassPanel>
      )}
    </div>
  );
}
