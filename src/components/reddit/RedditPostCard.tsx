"use client";

import React, { useState } from "react";
import { RedditPost, UserAction } from "@/types/reddit";
import { PostContextThread } from "./PostContextThread";
import { LLMResponsePanel } from "./LLMResponsePanel";
import { ActionButtonGroup } from "./ActionButtonGroup";

interface RedditPostCardProps {
  post: RedditPost;
  onAction: (
    postId: string,
    action: UserAction,
    editedResponse?: string
  ) => void;
  isLoading?: boolean;
}

export function RedditPostCard({
  post,
  onAction,
  isLoading = false,
}: RedditPostCardProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingAction, setPendingAction] = useState<UserAction>(
    post.user_action
  );

  const handleAction = (action: UserAction) => {
    if (action === "edit") {
      setIsEditMode(true);
      setPendingAction("edit");
    } else {
      setIsEditMode(false);
      setPendingAction(action);
      // For reply actions, send the original LLM response as content
      const content = action === "reply" ? post.llm_response : undefined;
      onAction(post.post_id, action, content);
    }
  };

  const handleSaveEdit = (editedResponse: string) => {
    setIsEditMode(false);
    setPendingAction("reply");
    onAction(post.post_id, "reply", editedResponse);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setPendingAction(post.user_action);
  };

  const getStatusIndicator = () => {
    const statusConfig = {
      pending: { color: "bg-orange-500", text: "Pending Review" },
      reply: { color: "bg-green-500", text: "Response Sent" },
      ignore: { color: "bg-gray-500", text: "Ignored" },
      edit: { color: "bg-blue-500", text: "Response Edited" },
    };

    const config = statusConfig[post.user_action];
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        <span className="text-sm text-gray-600">{config.text}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        {getStatusIndicator()}
        {post.time_ago && (
          <span className="text-sm text-gray-500">{post.time_ago}</span>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Post Context */}
        <div>
          <PostContextThread post={post} />
        </div>

        {/* Right Column - LLM Response */}
        <div>
          <LLMResponsePanel
            response={post.llm_response}
            isEditMode={isEditMode}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        </div>
      </div>

      {/* Actions Section */}
      <div className="border-t pt-4">
        <ActionButtonGroup
          currentAction={pendingAction}
          onAction={handleAction}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
