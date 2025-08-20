"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal, flushSync } from "react-dom";
import {
  motion,
  AnimatePresence,
  PanInfo,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { RedditPost } from "@/types/brand";
import ProspectCard from "./ProspectCard";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { AttractiveText } from "@/components/ui/AttractiveText";
import { useProspectPostAction } from "@/hooks/api/useProspectPostAction";
import { glassStyles } from "@/lib/styles/glassMorphism";
import { liquidGradients } from "@/lib/styles/gradients";

interface SwipeableProspectModalProps {
  isOpen: boolean;
  posts: RedditPost[];
  brandId: string;
  brandName?: string;
  brandDetail?: string;
  prospectId: string;
  problemToSolve?: string;
  onClose: () => void;
  onStackCompleted?: () => void;
}

const SWIPE_THRESHOLD = 100;
const MAX_ROTATION = 30;
const VISIBLE_CARDS = 3;
const SWIPE_VELOCITY_THRESHOLD = 500;

export default function SwipeableProspectModal({
  isOpen,
  posts,
  brandId,
  brandName,
  brandDetail,
  prospectId,
  problemToSolve,
  onClose,
  onStackCompleted,
}: SwipeableProspectModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [exitX, setExitX] = useState<number | "left" | "right" | null>(null);
  const [exitStartPosition, setExitStartPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [exitingPost, setExitingPost] = useState<RedditPost | null>(null);
  // Derive background card behavior from exit state instead of a separate flag

  // Use the mutation hook
  const postActionMutation = useProspectPostAction();

  // Motion values for drag
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Transform x position to rotation
  const rotate = useTransform(
    x,
    [-300, 0, 300],
    [-MAX_ROTATION, 0, MAX_ROTATION]
  );

  // Transform x position to opacity for indicators
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  // Background cards transition is coordinated with exitX so they promote smoothly

  const currentPost = posts[currentIndex];
  const hasNext = currentIndex < posts.length - 1;
  const progress =
    posts.length > 0 ? ((currentIndex + 1) / posts.length) * 100 : 0;

  // Debug exit / index transitions
  useEffect(() => {
    if (!isOpen) return;
    console.log("[SwipeableProspectModal] state", {
      currentIndex,
      exitX,
      hasNext,
      currentPostId: currentPost?.thing_id,
      postsCount: posts.length,
    });
  }, [
    currentIndex,
    exitX,
    hasNext,
    currentPost?.thing_id,
    isOpen,
    posts.length,
  ]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsAnimating(false);
      setExitX(null);
      // no extra stack flag needed
      x.set(0);
      y.set(0);
    }
  }, [isOpen, x, y]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (!currentPost || isAnimating) return;

      setIsAnimating(true);

      console.log("Handling swipe:", {
        direction,
        action: direction === "right" ? "queue" : "ignore",
        currentPost: currentPost.thing_id,
      });

      // Fire off API call asynchronously
      postActionMutation.mutate(
        {
          post: currentPost,
          action: direction === "right" ? "queue" : "ignore",
          brandId: brandId,
          brandName: brandName,
          brandDetail: brandDetail,
          prospectId: prospectId,
          problem: problemToSolve,
        },
        {
          onSuccess: (result) => {
            console.log("API call successful:", result);
          },
          onError: (error) => {
            console.error("Failed to perform action on post:", error);
          },
        }
      );

      // Capture current position before starting exit animation
      setExitStartPosition({ x: x.get(), y: y.get() });

      // Set exit animation direction
      setExitingPost(currentPost);
      setExitX(direction);
    },
    [
      currentPost,
      isAnimating,
      brandId,
      brandName,
      brandDetail,
      prospectId,
      problemToSolve,
      postActionMutation,
      x,
      y,
    ]
  );

  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      const swipeVelocity = info.velocity.x;
      const swipeDistance = info.offset.x;

      // Check if we should trigger a swipe based on velocity OR distance
      const shouldSwipe =
        Math.abs(swipeVelocity) > SWIPE_VELOCITY_THRESHOLD ||
        Math.abs(swipeDistance) > SWIPE_THRESHOLD;

      if (shouldSwipe) {
        const direction = swipeDistance > 0 ? "right" : "left";
        handleSwipe(direction);
      }
    },
    [handleSwipe]
  );

  if (!isOpen || posts.length === 0) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop with enhanced liquid blur */}
          <div
            className="absolute inset-0"
            style={{
              ...glassStyles.dark,
            }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{
                  ...glassStyles.light,
                  borderRadius: "9999px",
                }}
              >
                <motion.div
                  className="h-full relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  style={{
                    background: liquidGradients.progressBar,
                    boxShadow: "0 0 15px rgba(168, 85, 247, 0.3)",
                  }}
                >
                  {/* Shimmer effect on progress bar */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: liquidGradients.shimmer,
                    }}
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Card Stack */}
            <div
              className="relative flex"
              style={{
                height: "calc(85vh - 120px)",
                maxHeight: "900px",
                perspective: "1000px",
              }}
            >
              {/* Render background cards */}
              {[
                ...Array(
                  Math.min(VISIBLE_CARDS - 1, posts.length - currentIndex - 1)
                ),
              ].map((_, idx) => {
                const cardPosition = idx + 1;
                const postIndex = currentIndex + cardPosition;

                if (postIndex >= posts.length) return null;

                const post = posts[postIndex];
                const targetScale = exitX
                  ? 1 - (cardPosition - 1) * 0.05
                  : 1 - cardPosition * 0.05;
                const targetY = exitX
                  ? (cardPosition - 1) * 8
                  : cardPosition * 8;
                console.debug("[Stack] bg render", {
                  key: `bg-${post.thing_id}`,
                  cardPosition,
                  postIndex,
                  postId: post.thing_id,
                  currentIndex,
                  exitX,
                  targetScale,
                  targetY,
                });

                return (
                  <motion.div
                    key={`bg-${post.thing_id}`} // Use post ID instead of index
                    className="absolute inset-0 pointer-events-none"
                    layoutId={`card-${post.thing_id}`}
                    initial={false}
                    animate={{
                      // If an exit is in progress, shift up one slot
                      scale: exitX
                        ? 1 - (cardPosition - 1) * 0.05
                        : 1 - cardPosition * 0.05,
                      y: exitX ? (cardPosition - 1) * 8 : cardPosition * 8,
                      opacity: 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 220,
                      damping: 24,
                      delay: 0,
                    }}
                    style={{
                      zIndex: VISIBLE_CARDS - cardPosition,
                      transformStyle: "preserve-3d",
                    }}
                    layout
                  >
                    <ProspectCard
                      post={post}
                      brandId={brandId}
                      className="h-full"
                    />
                  </motion.div>
                );
              })}

              {/* Active draggable card */}
              <AnimatePresence mode="wait">
                {currentPost && exitX === null && (
                  <motion.div
                    key={currentPost.thing_id}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    layoutId={`card-${currentPost.thing_id}`}
                    style={{
                      x,
                      y,
                      rotate,
                      zIndex: VISIBLE_CARDS + 1,
                    }}
                    drag={!isAnimating}
                    dragSnapToOrigin
                    dragElastic={0.2}
                    dragConstraints={{
                      top: -50,
                      bottom: 50,
                      left: -1000,
                      right: 1000,
                    }}
                    onDragEnd={handleDragEnd}
                    whileDrag={{
                      cursor: "grabbing",
                      scale: 1.05,
                    }}
                    initial={false} // No initial animation for active card
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    }}
                  >
                    <ProspectCard
                      post={currentPost}
                      brandId={brandId}
                      className="h-full"
                    />

                    {/* Like Indicator */}
                    <motion.div
                      className="absolute top-8 left-8 pointer-events-none"
                      style={{ opacity: isAnimating ? 0 : likeOpacity }}
                    >
                      <div
                        className="p-4 rounded-full"
                        style={{
                          background: "rgba(34, 197, 94, 0.2)",
                          border: "3px solid #22c55e",
                          boxShadow: "0 0 20px rgba(34, 197, 94, 0.5)",
                        }}
                      >
                        <svg
                          className="w-12 h-12 text-emerald-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </motion.div>

                    {/* Ignore Indicator */}
                    <motion.div
                      className="absolute top-8 right-8 pointer-events-none"
                      style={{ opacity: isAnimating ? 0 : nopeOpacity }}
                    >
                      <div
                        className="p-4 rounded-full"
                        style={{
                          background: "rgba(239, 68, 68, 0.2)",
                          border: "3px solid #ef4444",
                          boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)",
                        }}
                      >
                        <svg
                          className="w-12 h-12 text-red-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Exit animation card */}
                {exitingPost && exitX !== null && (
                  <motion.div
                    key={`exit-${exitingPost.thing_id}`}
                    className="absolute inset-0"
                    initial={{
                      x: exitStartPosition.x,
                      y: exitStartPosition.y,
                      rotate: (exitStartPosition.x / 300) * MAX_ROTATION,
                      scale: 1,
                      opacity: 1,
                    }}
                    animate={{
                      x:
                        exitX === "right"
                          ? window.innerWidth * 1.5
                          : -window.innerWidth * 1.5,
                      y: -200,
                      opacity: 0,
                      scale: 0.5,
                      rotate: exitX === "right" ? 45 : -45,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 30,
                      duration: 0.4,
                    }}
                    onAnimationStart={() => {
                      console.log("[Exit] animation start", {
                        exitingPostId: exitingPost.thing_id,
                        exitX,
                        exitStartPosition,
                        currentIndex,
                      });
                    }}
                    onAnimationComplete={() => {
                      console.log("[Exit] animation complete", {
                        exitingPostId: exitingPost.thing_id,
                        exitX,
                        currentIndex,
                        hasNext,
                      });
                      // Reset motion values after exit animation completes
                      x.set(0);
                      y.set(0);

                      // Clean up and advance
                      if (hasNext) {
                        // Advance index synchronously before clearing exit to avoid flicker
                        flushSync(() => {
                          setCurrentIndex((prev) => prev + 1);
                        });
                        console.log("[Exit] index advanced", {
                          newIndex: currentIndex + 1,
                        });
                        setExitX(null);
                        setExitingPost(null);
                        console.log("[Exit] exitX cleared");
                        setIsAnimating(false);
                      } else {
                        onStackCompleted?.();
                        onClose();
                      }
                    }}
                    style={{
                      zIndex: VISIBLE_CARDS + 2,
                    }}
                  >
                    <ProspectCard
                      post={exitingPost}
                      brandId={brandId}
                      className="h-full"
                    />

                    {/* Exit indicators - show on exiting card */}
                    {exitX === "right" && (
                      <div className="absolute top-8 left-8 pointer-events-none">
                        <div
                          className="p-4 rounded-full"
                          style={{
                            background: "rgba(34, 197, 94, 0.2)",
                            border: "3px solid #22c55e",
                            boxShadow: "0 0 20px rgba(34, 197, 94, 0.5)",
                          }}
                        >
                          <svg
                            className="w-12 h-12 text-emerald-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}

                    {exitX === "left" && (
                      <div className="absolute top-8 right-8 pointer-events-none">
                        <div
                          className="p-4 rounded-full"
                          style={{
                            background: "rgba(239, 68, 68, 0.2)",
                            border: "3px solid #ef4444",
                            boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)",
                          }}
                        >
                          <svg
                            className="w-12 h-12 text-red-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center gap-6">
              <LiquidButton
                variant="danger"
                size="icon"
                onClick={() => {
                  console.log("Ignore button clicked");
                  handleSwipe("left");
                }}
                className="p-4 rounded-full"
                shimmer
                disabled={isAnimating}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </LiquidButton>

              <LiquidButton
                variant="primary"
                size="icon"
                onClick={() => {
                  console.log("Like button clicked");
                  handleSwipe("right");
                }}
                className="p-4 rounded-full"
                shimmer
                disabled={isAnimating}
              >
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </LiquidButton>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
