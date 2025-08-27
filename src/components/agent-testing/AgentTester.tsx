"use client";

import { useState, useEffect } from "react";
import { useBrand } from "@/contexts/BrandContext";
import { useAgent } from "@/hooks/api/useAgentQueries";
import { useGenerateReply } from "@/hooks/useGenerateReply";
import TestPostCarousel from "./TestPostCarousel";
import GlassPanel from "@/components/ui/GlassPanel";
import type { RedditPostUI } from "@/types/brand";
import { Sparkles, Copy, RefreshCw, Send } from "lucide-react";

interface AgentTesterProps {
  selectedAgentId: string | null;
}

export default function AgentTester({ selectedAgentId }: AgentTesterProps) {
  const { allActionedPosts, brand } = useBrand();
  const { data: agent } = useAgent(selectedAgentId || "", {
    enabled: !!selectedAgentId,
  });
  const { generateWithAgent, isGenerating } = useGenerateReply(brand?.id || "");

  const [selectedPost, setSelectedPost] = useState<RedditPostUI | null>(null);
  const [generatedReply, setGeneratedReply] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");

  // Reset state when agent changes
  useEffect(() => {
    setSelectedPost(null);
    setGeneratedReply("");
    setCustomPrompt("");
  }, [selectedAgentId]);

  // Auto-generate reply when post is selected
  useEffect(() => {
    if (selectedPost && agent && selectedAgentId) {
      handleGenerateReply();
    }
  }, [selectedPost]);

  const handleGenerateReply = async () => {
    if (!selectedPost || !agent || !selectedAgentId) return;

    try {
      // Remove the prospect_id field to match RedditPost type
      const { prospect_id, ...postWithoutProspectId } = selectedPost;

      const result = await generateWithAgent(
        selectedAgentId,
        postWithoutProspectId
      );
      setGeneratedReply(result.content);
    } catch (error) {
      console.error("Error generating reply:", error);
      alert("Failed to generate reply. Please try again.");
    }
  };

  const handleCopyReply = () => {
    if (generatedReply) {
      navigator.clipboard.writeText(generatedReply);
    }
  };

  if (!selectedAgentId) {
    return (
      <GlassPanel variant="light" className="p-8 text-center">
        <p className="text-white/60">Please select an agent to begin testing</p>
      </GlassPanel>
    );
  }

  if (!agent) {
    return (
      <GlassPanel variant="light" className="p-8 text-center">
        <p className="text-white/60">Loading agent data...</p>
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
            boxShadow: "inset 0 4px 12px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)",
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
              {generatedReply ? (
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
