"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
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
import { useBrandQuery } from "@/hooks/api/useBrandQuery";

interface SwipeableProspectModalProps {
  isOpen: boolean;
  posts: RedditPost[];
  brandId: string;
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
  prospectId,
  problemToSolve,
  onClose,
  onStackCompleted,
}: SwipeableProspectModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [exitX, setExitX] = useState(0);

  // Get brand data for the API call
  const { data: brandResponse } = useBrandQuery();
  const brandData = brandResponse?.brand;

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

  // Dynamic transforms for background cards based on top card movement
  const dragProgress = useTransform(x, [-300, 0, 300], [1, 0, 1]);

  // Scale and opacity for second card
  const secondCardScale = useTransform(dragProgress, [0, 1], [1, 0.95]);
  const secondCardOpacity = useTransform(dragProgress, [0, 1], [1, 0.6]);

  // Scale and opacity for third card
  const thirdCardScale = useTransform(dragProgress, [0, 1], [0.95, 0.9]);
  const thirdCardOpacity = useTransform(dragProgress, [0, 1], [0.5, 0.3]);

  const currentPost = posts[currentIndex];
  const hasNext = currentIndex < posts.length - 1;
  const progress =
    posts.length > 0 ? ((currentIndex + 1) / posts.length) * 100 : 0;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsAnimating(false);
      setExitX(0);
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
          brandName: brandData?.name,
          brandDetail: brandData?.detail || undefined,
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

      // Set exit animation direction
      setExitX(direction === "right" ? 250 : -250);
    },
    [
      currentPost,
      isAnimating,
      brandId,
      brandData,
      prospectId,
      problemToSolve,
      postActionMutation,
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
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(30px)",
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
                className="h-1.5 rounded-full overflow-hidden"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <motion.div
                  className="h-full relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  style={{
                    background:
                      "linear-gradient(90deg, #22c55e, #10b981, #a855f7, #9333ea)",
                    boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)",
                  }}
                >
                  {/* Shimmer effect on progress bar */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
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
              <div className="mt-2 text-center text-white/60 text-sm">
                <AttractiveText variant="subtle" size="sm">
                  {currentIndex + 1} of {posts.length} prospects
                </AttractiveText>
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
              {[...Array(Math.min(VISIBLE_CARDS - 1, posts.length - currentIndex - 1))].map((_, idx) => {
                const cardPosition = idx + 1;
                const postIndex = currentIndex + cardPosition;

                if (postIndex >= posts.length) return null;

                const post = posts[postIndex];

                return (
                  <motion.div
                    key={`bg-${postIndex}`}
                    className="absolute inset-0 pointer-events-none"
                    initial={{
                      scale: 1 - cardPosition * 0.05,
                      y: cardPosition * 8,
                      opacity: 1 - cardPosition * 0.3,
                    }}
                    animate={{
                      scale: cardPosition === 1 ? secondCardScale : thirdCardScale,
                      y: cardPosition * 8,
                      opacity: cardPosition === 1 ? secondCardOpacity : thirdCardOpacity,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 25,
                    }}
                    style={{
                      zIndex: VISIBLE_CARDS - cardPosition,
                      transformStyle: "preserve-3d",
                    }}
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
              <AnimatePresence
                onExitComplete={() => {
                  if (hasNext) {
                    setCurrentIndex((prev) => prev + 1);
                    setExitX(0);
                    setIsAnimating(false);
                    x.set(0);
                    y.set(0);
                  } else {
                    onStackCompleted?.();
                    onClose();
                  }
                }}
              >
                {currentPost && exitX === 0 && (
                  <motion.div
                    key={currentPost.thing_id}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    style={{
                      x,
                      y,
                      rotate,
                      zIndex: VISIBLE_CARDS + 1,
                    }}
                    drag={!isAnimating}
                    dragSnapToOrigin={true}
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
                    initial={{
                      scale: 0.95,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    exit={{
                      x: exitX * 5,
                      y: -100,
                      opacity: 0,
                      scale: 0.5,
                      rotate: exitX > 0 ? 45 : -45,
                      transition: {
                        duration: 0.5,
                        ease: [0.32, 0, 0.67, 0],
                      },
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
                      style={{ opacity: likeOpacity }}
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
                      style={{ opacity: nopeOpacity }}
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

            {/* Close button */}
            <LiquidButton
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute -top-12 right-0"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </LiquidButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}