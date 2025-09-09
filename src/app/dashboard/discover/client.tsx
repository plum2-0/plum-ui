"use client";

import { useSession } from "next-auth/react";
import { ProspectProvider } from "@/contexts/ProspectContext";
import { KeywordQueueProvider } from "@/contexts/KeywordQueueContext";
import { useScrapeJob, ScrapeJob } from "@/contexts/ScrapeJobContext";
import { useBrand } from "@/contexts/BrandContext";
import GlassPanel from "@/components/ui/GlassPanel";
import ProspectAccordion from "@/components/dashboard2/ProspectAccordion";
import ProspectTargetStat from "@/components/dashboard2/ProspectTargetsStat";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProspectPostAction } from "@/hooks/api/useProspectPostAction";
import { useAddBrandProspect } from "@/hooks/api/useBrandQuery";
import { GlassInput } from "@/components/ui/GlassInput";
import { useToast } from "@/components/ui/Toast";
import { useAppTour } from "@/contexts/TourContext";
import { Info } from "lucide-react";

interface BrandHeaderProps {
  name: string;
  website?: string | null;
}

function BrandHeader({ name, website }: BrandHeaderProps) {
  if (website) {
    return (
      <a
        href={website}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block group "
      >
        <h1 className="heading-1 group-hover:text-blue-400 transition-colors flex items-center gap-3 pb-2 ">
          {name}
          <svg
            className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </h1>
      </a>
    );
  }

  return <h1 className="heading-1 pb-2 border-b border-white/10">{name}</h1>;
}

function BrandSummary() {
  const {
    brand: brandData,
    postsToReview,
    totalPostsScraped,
    totalKeywordsCounts,
    brandAggregates,
    refetch,
  } = useBrand();
  const postActionMutation = useProspectPostAction();
  const { startTour, hasSeenTour } = useAppTour();

  // Auto-trigger tour for new users when they reach the discover page
  useEffect(() => {
    if (!hasSeenTour && brandData) {
      // Small delay to let the page fully render
      const timer = setTimeout(() => {
        startTour();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, brandData, startTour]);

  const handleSwipe = useCallback(
    ({ direction, post }: { direction: "left" | "right"; post: any }) => {
      if (!brandData) return;
      const prospect = brandData.prospects?.find(
        (p) => p.id === post.prospect_id
      );
      const problem = prospect?.problem_to_solve;
      postActionMutation.mutate({
        post,
        action: direction === "right" ? "queue" : "ignore",
        brandId: brandData.id,
        brandName: brandData.name,
        brandDetail: brandData.detail || undefined,
        prospectId: post.prospect_id,
        problem,
      });
    },
    [brandData, postActionMutation]
  );

  if (!brandData) return null;
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <BrandHeader name={brandData.name} website={brandData.website} />
          {/* Tour Help Button */}
          <button
            onClick={startTour}
            className="p-2 rounded-lg transition-all hover:transform hover:-translate-y-0.5 group"
            style={{
              background:
                "linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow:
                "0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
            title="Start app tour"
          >
            <Info className="w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors" />
          </button>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent backdrop-blur-sm mt-2 mb-6" />

        <div className="space-y-8">
          <ProspectTargetStat
            brandId={brandData.id}
            posts={postsToReview}
            uniqueUsers={brandAggregates.totalPotentialCustomers}
            uniquePendingAuthors={brandAggregates.uniquePendingAuthors}
            uniqueActionedAuthors={brandAggregates.uniqueActionedAuthors}
            totalPostsScraped={totalPostsScraped}
            totalKeywordCounts={totalKeywordsCounts}
            onSwipe={handleSwipe}
            problemToSolve="Overview - All Use Cases"
            onStackCompleted={() => {
              console.log("All prospects reviewed! Refreshing brand data...");
              refetch();
            }}
            onModalClose={() => {
              console.log("Modal closed, refreshing brand data...");
              refetch();
            }}
          />

          {/* Help Hint Section */}
          <HelpHintSection />
        </div>

        {/* Prospect Accordion */}
        <div>
          <div className="content-divider my-8"></div>
          <div className="flex items-center justify-between mb-2">
            {/* <AddProspectButton brandId={brandData.id} /> */}
          </div>
          {brandData.prospects && brandData.prospects.length > 0 ? (
            <ProspectAccordion prospects={brandData.prospects} />
          ) : (
            <div className="mt-4 text-center py-8">
              <p className="text-white/50 text-sm">
                No prospects defined yet. Click the + button to add your first
                problem to validate.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AddProspectButtonProps {
  brandId: string;
}

function AddProspectButton({ brandId }: AddProspectButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const addProspectMutation = useAddBrandProspect();
  const { showToast } = useToast();
  const { brand: brandData } = useBrand();

  // Maximum number of prospects allowed
  const MAX_PROSPECTS = 3;

  // Auto-focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = async () => {
    if (!inputValue.trim()) {
      showToast({
        message: "Please enter a problem description",
        type: "error",
      });
      return;
    }

    // Check prospect limit
    const currentProspectCount = brandData?.prospects?.length || 0;
    if (currentProspectCount >= MAX_PROSPECTS) {
      showToast({
        message: `Prospect limit exceeded. You already have ${currentProspectCount} prospect${
          currentProspectCount > 1 ? "s" : ""
        }. Maximum ${MAX_PROSPECTS} prospects allowed. Please delete an existing prospect to add a new one.`,
        type: "error",
        duration: 7000,
      });
      return;
    }

    try {
      await addProspectMutation.mutateAsync({
        brandId,
        problemToSolve: inputValue.trim(),
      });

      showToast({
        message: "New prospect added successfully",
        type: "success",
      });

      // Reset state
      setInputValue("");
      setIsExpanded(false);
    } catch {
      showToast({
        message: "Failed to add prospect. Please try again.",
        type: "error",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      setInputValue("");
      setIsExpanded(false);
    }
  };

  // Check if we've reached the prospect limit
  const currentProspectCount = brandData?.prospects?.length || 0;
  const isAtLimit = currentProspectCount >= MAX_PROSPECTS;

  return (
    <AnimatePresence mode="wait">
      {!isExpanded ? (
        <motion.button
          key="button"
          onClick={() => {
            if (isAtLimit) {
              showToast({
                message: `Problem Research limit reached. You already have ${currentProspectCount} prospect${
                  currentProspectCount > 1 ? "s" : ""
                }. Maximum ${MAX_PROSPECTS} prospects allowed. Please delete an existing prospect to add a new one.`,
                type: "error",
                duration: 7000,
              });
            } else {
              setIsExpanded(true);
            }
          }}
          className={`group relative ${
            isAtLimit ? "opacity-50 cursor-not-allowed" : ""
          }`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          whileHover={!isAtLimit ? { scale: 1.05 } : {}}
          whileTap={!isAtLimit ? { scale: 0.95 } : {}}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(34, 197, 94, 0.2))",
              border: "1px solid transparent",
              backgroundImage: `
                linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(34, 197, 94, 0.2)),
                linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(34, 197, 94, 0.4))
              `,
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
              boxShadow:
                "0 2px 8px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            <svg
              className="w-4 h-4 text-white/80 transition-transform group-hover:rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          {/* Hover tooltip */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="text-xs text-white/60 whitespace-nowrap">
              {isAtLimit ? "Problem Research Limit Reached" : "Add Problem"}
            </span>
          </div>
        </motion.button>
      ) : (
        <motion.div
          key="input"
          className="relative"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "320px" }}
          exit={{ opacity: 0, width: 0 }}
          transition={{
            duration: 0.3,
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
        >
          <div className="space-y-2">
            {/* Helper text */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs text-white/60 font-body"
            >
              What problem are you looking to validate?
            </motion.p>

            {/* Input container */}
            <div className="relative">
              <GlassInput
                ref={inputRef as any}
                type="textarea"
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setInputValue(e.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Describe a new problem to validate..."
                variant="ultra"
                shimmer={true}
                autoResize={true}
                rows={1}
                minHeight="44px"
                maxHeight="180px"
                className="py-2"
                disabled={addProspectMutation.isPending}
              />

              {/* Action buttons */}
              <div className="absolute right-2 bottom-2 flex gap-1">
                <motion.button
                  onClick={() => {
                    setInputValue("");
                    setIsExpanded(false);
                  }}
                  disabled={addProspectMutation.isPending}
                  className="px-2 py-1 rounded-md text-xs font-medium text-white/60 hover:text-white/80 transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={addProspectMutation.isPending || !inputValue.trim()}
                  className="px-3 py-1 rounded-md text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: addProspectMutation.isPending
                      ? "rgba(168, 85, 247, 0.2)"
                      : "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(34, 197, 94, 0.3))",
                    border: "1px solid rgba(168, 85, 247, 0.4)",
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {addProspectMutation.isPending ? (
                    <div className="flex items-center gap-1">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-white/60"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span>Adding...</span>
                    </div>
                  ) : (
                    "Add"
                  )}
                </motion.button>
              </div>
            </div>

            {/* Hint text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs text-white/40 font-body"
            >
              Press <span className="text-white/60">Enter</span> to add or{" "}
              <span className="text-white/60">Esc</span> to cancel
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type HintType =
  | "no-posts"
  | "no-prospects"
  | "low-engagement"
  | "prospects-need-scraping"
  | null;
type NonNullHint = Exclude<HintType, null>;

interface HintConfig {
  type: HintType;
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionHandler: () => void;
}

function HelpHintSection() {
  const { brand: brandData, postsToReview, prospectsDisplay } = useBrand();
  const { openDrawer } = useScrapeJob();
  const [currentHint, setCurrentHint] = useState<HintType>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (!brandData) return;

    // Check conditions in priority order
    if (!brandData.prospects || brandData.prospects.length === 0) {
      setCurrentHint("no-prospects");
    } else {
      // Check if any prospects have 0 pending posts
      const prospectsNeedingScraping = prospectsDisplay.filter(
        (prospect) =>
          !prospect.pendingPosts || prospect.pendingPosts.length === 0
      );

      if (prospectsNeedingScraping.length > 0) {
        setCurrentHint("prospects-need-scraping");
      } else if (postsToReview.length === 0) {
        setCurrentHint("no-posts");
      } else {
        setCurrentHint(null);
        // // Check for low engagement (example: average score < 5)
        // const avgScore =
        //   postsToReview.reduce((acc, post) => acc + (post.score || 0), 0) /
        //   (postsToReview.length || 1);
        // if (avgScore < 5) {
        //   setCurrentHint("low-engagement");
        // } else {
        //   setCurrentHint(null);
        // }
      }
    }
  }, [brandData, postsToReview, prospectsDisplay]);

  const handleScrapeAllProspects = useCallback(() => {
    if (!brandData || !brandData.prospects) return;

    const scrapeJobs: ScrapeJob[] = brandData.prospects.map((prospect) => {
      // Get top 3 keywords with engagement
      const keywordEngagements = prospect.keywords_to_engaged_count || {};
      const sortedEngagedKeywords = Object.entries(keywordEngagements)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([keyword]) => keyword);

      // Get other keywords not in the top engaged list
      const otherKeywords =
        prospect.keywords?.filter((k) => !sortedEngagedKeywords.includes(k)) ||
        [];

      // Default keywords to use: top engaged + remaining up to 3 total
      const defaultKeywords = [
        ...sortedEngagedKeywords,
        ...otherKeywords.slice(
          0,
          Math.max(0, 3 - sortedEngagedKeywords.length)
        ),
      ];

      return {
        prospectId: prospect.id,
        brandName: brandData.name,
        problemToSolve: prospect.problem_to_solve,
        keywords: defaultKeywords,
        existingProspectKeywords: prospect.keywords || [],
        setKeywords: sortedEngagedKeywords,
        otherKeywords: otherKeywords,
        keywordEngagementCounts: keywordEngagements,
        numPosts: 50, // Default number of posts per prospect
      };
    });

    // Open drawer with the jobs
    openDrawer(scrapeJobs);
  }, [brandData, openDrawer]);

  const handleScrapeProspectsWithNoPosts = useCallback(() => {
    if (!brandData || !brandData.prospects) return;

    // Filter prospects that need scraping (have 0 pending posts)
    const prospectsNeedingScraping = prospectsDisplay.filter(
      (prospectDisplay) =>
        !prospectDisplay.pendingPosts ||
        prospectDisplay.pendingPosts.length === 0
    );

    // Find the full prospect data for those that need scraping
    const scrapeJobs = prospectsNeedingScraping
      .map((prospectDisplay) => {
        const prospect = brandData.prospects?.find(
          (p) => p.id === prospectDisplay.id
        );
        if (!prospect) return null;

        // Get top 3 keywords with engagement
        const keywordEngagements = prospect.keywords_to_engaged_count || {};
        const sortedEngagedKeywords = Object.entries(keywordEngagements)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([keyword]) => keyword);

        // Get other keywords not in the top engaged list
        const otherKeywords =
          prospect.keywords?.filter(
            (k) => !sortedEngagedKeywords.includes(k)
          ) || [];

        // Default keywords to use: top engaged keywords first
        const defaultKeywords =
          sortedEngagedKeywords.length > 0
            ? sortedEngagedKeywords
            : otherKeywords.slice(0, 3); // Fallback to first 3 regular keywords if no engagement data

        return {
          prospectId: prospect.id,
          brandName: brandData.name,
          problemToSolve: prospect.problem_to_solve,
          keywords: defaultKeywords,
          existingProspectKeywords: prospect.keywords || [],
          setKeywords: sortedEngagedKeywords,
          otherKeywords: otherKeywords,
          keywordEngagementCounts: keywordEngagements,
          numPosts: 50, // Default number of posts per prospect
        };
      })
      .filter((job) => job !== null) as ScrapeJob[];

    // Open drawer with the jobs
    if (scrapeJobs.length > 0) {
      openDrawer(scrapeJobs);
    }
  }, [brandData, prospectsDisplay, openDrawer]);

  const hints: Record<NonNullHint, Omit<HintConfig, "type">> = {
    "no-posts": {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      ),
      title: "No Customer Conversations Found",
      description:
        "We haven't found any Reddit posts yet. Start discovering potential customers by searching through more posts.",
      actionLabel: "Search for Customers",
      actionHandler: handleScrapeAllProspects,
    },
    "no-prospects": {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      title: "No Target Prospects Defined",
      description:
        "Define your ideal customer profiles to start finding relevant conversations.",
      actionLabel: "Define Prospects",
      actionHandler: () => console.log("Navigate to prospect creation"),
    },
    "low-engagement": {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      title: "Low Engagement Detected",
      description:
        "The posts we found have low engagement. Consider refining your keywords to find more active discussions.",
      actionLabel: "Optimize Keywords",
      actionHandler: () => console.log("Navigate to keyword optimization"),
    },
    "prospects-need-scraping": {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      title: "Look for more Leads to Engage",
      description: `You have reviewed all of your leads`,
      actionLabel: "Set Up Job",
      actionHandler: handleScrapeProspectsWithNoPosts,
    },
  };

  if (!currentHint || !hints[currentHint]) return null;

  const hintConfig = hints[currentHint];

  return (
    <AnimatePresence>
      {!isMinimized && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{
            duration: 0.5,
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
        >
          <motion.div
            className="rounded-xl p-4 relative overflow-hidden"
            animate={
              !hasInteracted
                ? {
                    boxShadow: [
                      "0 0 20px rgba(251, 146, 60, 0.3), 0 0 40px rgba(251, 146, 60, 0.1)",
                      "0 0 30px rgba(251, 146, 60, 0.5), 0 0 60px rgba(251, 146, 60, 0.2)",
                      "0 0 20px rgba(251, 146, 60, 0.3), 0 0 40px rgba(251, 146, 60, 0.1)",
                    ],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: hasInteracted ? 0 : Infinity,
              ease: "easeInOut",
            }}
            onMouseEnter={() => setHasInteracted(true)}
            style={{
              background: `linear-gradient(135deg,
                rgba(251, 146, 60, 0.15) 0%,
                rgba(245, 158, 11, 0.12) 25%,
                rgba(252, 211, 77, 0.08) 50%,
                rgba(251, 146, 60, 0.1) 75%,
                rgba(245, 158, 11, 0.08) 100%)`,
              backdropFilter: "blur(10px) saturate(1.5)",
              WebkitBackdropFilter: "blur(10px) saturate(1.5)",
              border: "1px solid transparent",
              backgroundImage: `
                linear-gradient(135deg,
                  rgba(251, 146, 60, 0.15) 0%,
                  rgba(245, 158, 11, 0.12) 25%,
                  rgba(252, 211, 77, 0.08) 50%,
                  rgba(251, 146, 60, 0.1) 75%,
                  rgba(245, 158, 11, 0.08) 100%),
                linear-gradient(135deg,
                  rgba(251, 146, 60, 0.6) 0%,
                  rgba(252, 211, 77, 0.4) 100%)
              `,
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
              boxShadow:
                "0 0 20px rgba(251, 146, 60, 0.3), 0 0 40px rgba(251, 146, 60, 0.1)",
            }}
          >
            {/* Animated gradient overlay */}
            <motion.div
              className="absolute inset-0 opacity-30 pointer-events-none"
              animate={{
                background: [
                  "radial-gradient(circle at 0% 50%, rgba(251, 146, 60, 0.3) 0%, transparent 50%)",
                  "radial-gradient(circle at 100% 50%, rgba(252, 211, 77, 0.3) 0%, transparent 50%)",
                  "radial-gradient(circle at 0% 50%, rgba(251, 146, 60, 0.3) 0%, transparent 50%)",
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ x: "-100%" }}
              animate={!hasInteracted ? { x: "200%" } : {}}
              transition={{
                duration: 3,
                repeat: hasInteracted ? 0 : Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
            >
              <div
                className="h-full w-1/2"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                  transform: "skewX(-20deg)",
                }}
              />
            </motion.div>

            {/* Close button */}
            <button
              onClick={() => {
                setIsMinimized(true);
                setHasInteracted(true);
              }}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 transition-all z-10"
            >
              <svg
                className="w-4 h-4 text-white/60 hover:text-white/80"
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
            </button>

            <div className="flex items-center gap-4 relative z-10">
              {/* Animated Icon */}
              <motion.div
                className="flex-shrink-0"
                animate={
                  !hasInteracted
                    ? {
                        rotate: [0, -10, 10, -10, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 0.5,
                  repeat: hasInteracted ? 0 : Infinity,
                  repeatDelay: 2,
                }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center relative">
                  {/* Pulsing background */}
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(251, 146, 60, 0.3), rgba(252, 211, 77, 0.2))",
                      filter: "blur(8px)",
                    }}
                  />
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(251, 146, 60, 0.4), rgba(252, 211, 77, 0.3))",
                      border: "1px solid rgba(251, 146, 60, 0.5)",
                      boxShadow:
                        "inset 0 2px 4px rgba(255, 255, 255, 0.2), 0 4px 12px rgba(251, 146, 60, 0.3)",
                    }}
                  >
                    <div className="text-orange-300">{hintConfig.icon}</div>
                  </div>
                </div>
              </motion.div>

              {/* Content */}
              <div className="flex-1 flex items-center justify-between pr-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <motion.span
                      className="text-sm font-bold"
                      animate={{
                        color: ["#fb923c", "#fcd34d", "#fb923c"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      ✨ We're Here to Help!
                    </motion.span>
                    <h3 className="text-sm font-bold text-white">
                      {hintConfig.title}
                    </h3>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {hintConfig.description}
                  </p>
                </div>

                {/* Action Button with glow */}
                <motion.button
                  onClick={() => {
                    hintConfig.actionHandler();
                    setHasInteracted(true);
                  }}
                  className="ml-4 px-4 py-2 rounded-lg font-semibold text-sm relative overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(251, 146, 60, 0.8), rgba(245, 158, 11, 0.8))",
                    color: "white",
                    boxShadow:
                      "0 4px 15px rgba(251, 146, 60, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                  }}
                >
                  {/* Button shimmer */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background:
                        "linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                    }}
                  />
                  <span className="relative flex items-center gap-2">
                    {hintConfig.actionLabel}
                    <motion.svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{
                        x: [0, 3, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </motion.svg>
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DiscoverContent() {
  const { brand: brandData, isLoading, error } = useBrand();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-white text-xl font-body">
          Loading brand data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-300 text-xl font-body">
          Error: {error.message}
        </div>
      </div>
    );
  }

  if (!brandData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl font-body">No brand data found</div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-8 pb-8">
          <BrandSummary />
        </div>
      </div>
    </main>
  );
}

export default function DiscoverPageClient() {
  useSession();

  return (
    <ProspectProvider>
      <KeywordQueueProvider>
        <DiscoverContent />
      </KeywordQueueProvider>
    </ProspectProvider>
  );
}
