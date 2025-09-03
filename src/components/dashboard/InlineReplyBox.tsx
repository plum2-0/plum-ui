"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Bot, RefreshCw, Loader2, ExternalLink, User } from "lucide-react";
import Link from "next/link";
import { useBrand } from "@/contexts/BrandContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useProspectProfiles } from "@/contexts/ProspectProfilesContext";
import { useProspectConvoReply } from "@/hooks/api/useProspectConvoReply";
import { useAgentReply } from "@/hooks/useAgentReply";
import { useToast } from "@/components/ui/Toast";

interface InlineReplyBoxProps {
  parentPost: any; // The actual Reddit post/comment data
  onClose: () => void;
  onSuccess?: () => void;
}

export function InlineReplyBox({ 
  parentPost,
  onClose,
  onSuccess 
}: InlineReplyBoxProps) {
  const [replyText, setReplyText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasTriedGeneration, setHasTriedGeneration] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { brand: brandData } = useBrand();
  const { activeConvoId, prospectProfileId } = useProfile();
  const { currentProfileId } = useProspectProfiles();
  const replyConvo = useProspectConvoReply();
  const { showToast } = useToast();
  
  // Use the agent reply hook with proper brand ID
  const { agents, isLoadingAgents, generateWithAgent, isBrandLoaded } = useAgentReply(brandData?.id || "");
  const agent = agents[0] || null;
  
  // Reset state when profile changes
  useEffect(() => {
    if (currentProfileId) {
      // Reset all state when profile changes
      setReplyText("");
      setIsGenerating(false);
      setHasTriedGeneration(false);
    }
  }, [currentProfileId]);
  
  // Debug logging
  useEffect(() => {
    console.log("InlineReplyBox Debug:", {
      brandId: brandData?.id,
      brandName: brandData?.name,
      agentsCount: agents.length,
      isLoadingAgents,
      isBrandLoaded,
      agent,
      currentProfileId,
    });
  }, [brandData, agents, isLoadingAgents, isBrandLoaded, agent, currentProfileId]);
  
  // Auto-focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);
  
  // Auto-generate reply when agents are loaded
  useEffect(() => {
    // Only try to generate once, when we have agents and brand data loaded
    if (!hasTriedGeneration && !isLoadingAgents && isBrandLoaded && agent) {
      setHasTriedGeneration(true);
      handleGenerateReply();
    }
  }, [hasTriedGeneration, isLoadingAgents, isBrandLoaded, agent]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [replyText]);
  
  const handleGenerateReply = async () => {
    if (!brandData?.id) {
      console.error("No brand ID available");
      showToast({
        message: "Brand data is still loading. Please try again.",
        type: "error",
        duration: 3000,
      });
      return;
    }
    
    if (isLoadingAgents) {
      console.log("Agents are still loading...");
      return;
    }
    
    if (!agent) {
      console.error("No agent found", { agents, brandId: brandData.id });
      showToast({
        message: "No agent available. Please create an agent first.",
        type: "error",
        duration: 3000,
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      // Use the actual parent post data, ensuring it has required fields
      const postForGeneration = {
        ...parentPost,
        status: parentPost.status || "PENDING", // Ensure status field exists
        content: parentPost.content || parentPost.body || parentPost.title || "",
        title: parentPost.title || "",
        subreddit: parentPost.subreddit || "",
        permalink: parentPost.permalink || "",
        score: parentPost.score || 0,
        reply_count: parentPost.reply_count || 0,
      };
      
      const result = await generateWithAgent(agent.id, postForGeneration);
      
      if (result.content) {
        setReplyText(result.content);
      }
    } catch (error) {
      console.error("Error generating reply:", error);
      showToast({
        message: "Failed to generate reply",
        type: "error",
        duration: 3000,
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSendReply = async () => {
    if (!replyText.trim() || replyConvo.isPending) return;
    
    if (!brandData?.id || !prospectProfileId || !activeConvoId) {
      showToast({
        message: "Missing required context for reply",
        type: "error",
        duration: 3000,
      });
      return;
    }
    
    try {
      await replyConvo.mutateAsync({
        brandId: brandData.id,
        prospectProfileId,
        activeConvoId,
        parentPostThingId: parentPost.thing_id,
        replyText: replyText,
      });
      
      showToast({
        message: "Reply sent successfully!",
        type: "success",
        duration: 3000,
      });
      
      // Clear text and close
      setReplyText("");
      onClose();
      
      // Trigger success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      showToast({
        message: "Failed to send reply",
        type: "error",
        duration: 3000,
      });
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="mt-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">
              Replying to <span className="text-blue-400">u/{parentPost.author || "[deleted]"}</span>
            </span>
            {(isLoadingAgents || (isGenerating && !replyText)) && (
              <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
            )}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Agent Info Section */}
        {agent && (
          <div className="mb-3 p-2 bg-zinc-900/50 rounded-lg border border-zinc-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-200">
                      {agent.name}
                    </span>
                    <span className="text-xs text-zinc-500">•</span>
                    <span className="text-xs text-zinc-500">AI Agent</span>
                  </div>
                  {agent.persona && (
                    <div className="text-xs text-zinc-500 truncate max-w-xs" title={agent.persona}>
                      <span className="text-zinc-600">Persona:</span> {agent.persona.length > 80 ? 
                        agent.persona.substring(0, 80) + "..." : 
                        agent.persona}
                    </div>
                  )}
                  {agent.goal && (
                    <div className="text-xs text-zinc-500 truncate max-w-xs" title={agent.goal}>
                      <span className="text-zinc-600">Goal:</span> {agent.goal.length > 80 ? 
                        agent.goal.substring(0, 80) + "..." : 
                        agent.goal}
                    </div>
                  )}
                </div>
              </div>
              <Link
                href={`/dashboard/agent?selected=${agent.id}`}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-zinc-800 
                         hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="View and edit agent details"
              >
                <span>Manage</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
        
        {/* No Agent Warning */}
        {!agent && !isLoadingAgents && (
          <div className="mb-3 p-2 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-yellow-600">
                  No agent configured for this brand
                </span>
              </div>
              <Link
                href="/dashboard/agent"
                className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-yellow-600/20 
                         hover:bg-yellow-600/30 text-yellow-600 transition-colors"
              >
                <span>Create Agent</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
        
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={
            isGenerating 
              ? "Generating AI reply..." 
              : isLoadingAgents 
              ? "Loading agents..." 
              : "Type your reply..."
          }
          disabled={isGenerating || isLoadingAgents}
          className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-200 
                     placeholder-zinc-500 resize-none focus:outline-none focus:border-zinc-600
                     disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minHeight: "80px", maxHeight: "200px" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              handleSendReply();
            }
          }}
        />
        
        {/* Actions */}
        <div className="flex items-center justify-between mt-2">
          {/* AI Generate */}
          <div className="flex items-center gap-2">
            {agent && (
              <button
                onClick={handleGenerateReply}
                disabled={isGenerating || isLoadingAgents}
                className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-purple-500/20 
                         text-purple-300 hover:bg-purple-500/30 transition-colors 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Bot className="w-3 h-3" />
                )}
                {isGenerating ? "Generating..." : "AI Reply"}
              </button>
            )}
          </div>
          
          {/* Submit buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 text-xs rounded bg-zinc-700 text-zinc-300 
                       hover:bg-zinc-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendReply}
              disabled={!replyText.trim() || replyConvo.isPending}
              className="flex items-center gap-1 px-3 py-1 text-xs rounded 
                       bg-green-600 text-white hover:bg-green-500 transition-colors 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3 h-3" />
              {replyConvo.isPending ? "Sending..." : "Reply"}
            </button>
          </div>
        </div>
        
        {/* Hint */}
        <div className="mt-2 text-xs text-zinc-500">
          Tip: Press Ctrl+Enter to send
        </div>
      </motion.div>
    </AnimatePresence>
  );
}