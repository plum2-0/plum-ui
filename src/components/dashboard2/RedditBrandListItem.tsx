"use client";

import { useState, useEffect } from "react";
import type { RedditPost } from "@/types/brand";
import GlassPanel from "@/components/ui/GlassPanel";
import { useProspectPostAction } from "@/hooks/api/useProspectPostAction";
import {
  formatTimeAgo,
  RedditPostHeader,
  RedditPostTitle,
  RedditPostContent,
  RedditStatBadges,
} from "./RedditItemCommon";

interface RedditPostListItemProps {
  post: RedditPost;
  brandId?: string;
  prospectId?: string;
  onIgnore?: (post: RedditPost) => Promise<void>;
}

// Agents will be used for reply generation instead of personas

export default function RedditBrandListItem({
  post,
  brandId,
  prospectId,
  onIgnore,
}: RedditPostListItemProps) {
  const prospectPostAction = useProspectPostAction();
  // Derived fields
  const postId = post.thing_id;
  const postTitle = post.title || "";
  const postContent = post.content;
  const postAuthor = post.author;
  const postSubreddit = post.subreddit;
  const postLink = `https://reddit.com${post.permalink}`;
  const postCreatedAt = new Date(post.created_utc * 1000).toISOString();
  const postUpVotes = post.upvotes || post.score || 0;
  const postNumComments = post.reply_count || 0;
  const llmExplanation = post.suggested_agent_reply || "";

  // Check if this is a RedditPost with suggested_agent_reply
  const hasSuggestedReply = !!post.suggested_agent_reply;

  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(!!hasSuggestedReply);

  // Check if we're returning from Reddit auth for this specific post
  useEffect(() => {
    // Check URL hash for post ID
    const hash = window.location.hash;
    if (hash === `#post-${postId}`) {
      // This is the post user was working on before redirect
      // Check for saved draft
      const draftKey: string = `reddit-reply-draft-${postId}`;
      const draftData = sessionStorage.getItem(draftKey);

      if (draftData) {
        // Open reply box automatically
        setShowReplyBox(true);

        // Scroll to this post after a brief delay to ensure DOM is ready
        setTimeout(() => {
          const element = document.getElementById(`post-${postId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);

        // Clear the hash after handling
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }
    }
  }, [postId]);
  // const postStatus = post.status;

  // Extract mentioned brand from llm_explanation
  const mentionedBrand = llmExplanation
    ?.match(
      /(?:mentions?|discusses?|talks? about)\s+([A-Za-z0-9\s]+?)(?:\s+(?:in|as|for|with|to|and|or|but|because|since|although|while|if|when|where|why|how|that|which|who|whom|whose)|\.|,|;|:|\?|!|$)/i
    )?.[1]
    ?.trim();

  async function handleIgnore() {
    if (!brandId || !prospectId) {
      console.error("Missing brandId or prospectId for ignore action");
      alert("Unable to ignore post. Missing required information.");
      return;
    }

    setIsSubmittingAction(true);
    try {
      await prospectPostAction.mutateAsync({
        post,
        action: "ignore",
        brandId,
        prospectId,
      });

      // Call legacy onIgnore if provided for backward compatibility
      if (onIgnore) {
        await onIgnore(post);
      }
    } catch (error) {
      console.error("Error ignoring post:", error);
      alert("Failed to ignore post. Please try again.");
    } finally {
      setIsSubmittingAction(false);
    }
  }

  async function handleAddToEngage() {
    if (!brandId || !prospectId) {
      console.error("Missing brandId or prospectId for queue action");
      alert(
        "Unable to add post to engagement queue. Missing required information."
      );
      return;
    }

    setIsSubmittingAction(true);
    try {
      await prospectPostAction.mutateAsync({
        post,
        action: "queue",
        brandId,
        prospectId,
      });
    } catch (error) {
      console.error("Error adding post to engagement queue:", error);
      alert("Failed to add post to engagement queue. Please try again.");
    } finally {
      setIsSubmittingAction(false);
    }
  }

  // Get truncated content for preview
  const contentToShow = postContent || "";
  return (
    <div id={`post-${postId}`} className="group">
      <div className="rounded-lg border border-[#343536] bg-[#1a1a1b] p-5 transition-colors duration-200 hover:border-[#4f5355]">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Subreddit mention */}
            <RedditPostHeader
              subreddit={postSubreddit}
              author={postAuthor}
              createdAt={postCreatedAt}
              mentionedBrand={mentionedBrand}
            />

            {/* Post title - Clickable */}
            <RedditPostTitle title={postTitle} link={postLink} />

            {/* Post Content - Collapsible */}
            {contentToShow && <RedditPostContent content={contentToShow} />}

            {/* Tags removed with SubredditPost deprecation */}

            {/* Action bar with counters on the left */}
            <div
              className="flex items-center gap-3 pt-4 border-t border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left-aligned counters styled as badges */}
              <RedditStatBadges
                upvotes={postUpVotes}
                comments={postNumComments}
              />

              {/* Spacer to push actions to the right */}
              <div className="ml-auto flex items-center gap-3">
                <GlassPanel
                  as="button"
                  onClick={handleAddToEngage}
                  disabled={isSubmittingAction}
                  className="px-4 py-2 rounded-xl font-body font-medium text-sm transition-all duration-300 hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(16, 185, 129, 0.8))",
                    color: "white",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
                  }}
                >
                  {isSubmittingAction ? "Processing..." : "Add To Engage"}
                </GlassPanel>

                <GlassPanel
                  as="button"
                  onClick={handleIgnore}
                  disabled={isSubmittingAction}
                  className="px-4 py-2 rounded-xl font-body font-medium text-sm transition-all duration-300 hover:scale-105"
                  variant="light"
                  style={{
                    color: "white",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {isSubmittingAction ? "Processing..." : "Ignore"}
                </GlassPanel>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
