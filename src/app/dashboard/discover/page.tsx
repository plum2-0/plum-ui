"use client";

import { useSession } from "next-auth/react";
import { ProspectProvider } from "@/contexts/ProspectContext";
import { KeywordQueueProvider } from "@/contexts/KeywordQueueContext";
import {
  ScrapeJobProvider,
  useScrapeJob,
  ScrapeJob,
} from "@/contexts/ScrapeJobContext";
import { useBrand } from "@/contexts/BrandContext";
import GlassPanel from "@/components/ui/GlassPanel";
import ProspectAccordion from "@/components/dashboard2/ProspectAccordion";
import KeywordDisplay from "@/components/dashboard2/KeywordDisplay";
import SubredditsSection from "@/components/dashboard2/SubredditsSection";
import ProspectTargetStat from "@/components/dashboard2/ProspectTargetsStat";
import VizSummaryView from "@/components/dashboard2/VizSummaryView";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
        className="inline-block group mb-8"
      >
        <h1 className="heading-1 group-hover:text-blue-400 transition-colors flex items-center gap-3 pb-2 border-b border-white/10">
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

  return (
    <h1 className="heading-1 mb-8 pb-2 border-b border-white/10">{name}</h1>
  );
}

function BrandSummary() {
  const { brand: brandData, allSourcedRedditPosts } = useBrand();

  if (!brandData) return null;

  const brandId = brandData.id;
  return (
    <GlassPanel
      className="rounded-2xl p-6"
      variant="medium"
      style={{
        background:
          "linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
        backdropFilter: "blur(20px) saturate(1.2)",
        WebkitBackdropFilter: "blur(20px) saturate(1.2)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <BrandHeader name={brandData.name} website={brandData.website} />

          <div className="space-y-8">
            <ProspectTargetStat
              brandId={brandId}
              posts={allSourcedRedditPosts}
              prospectId={"overview stat"}
              problemToSolve="Overview - All Use Cases"
              onStackCompleted={() => {
                console.log("All prospects reviewed!");
              }}
            />

            {/* Help Hint Section */}
            <HelpHintSection />
          </div>

          {/* Prospect Accordion */}
          {brandData.prospects && brandData.prospects.length > 0 && (
            <div>
              <div className="content-divider my-8"></div>
              <div className="flex items-center gap-2 mb-2">
                <span className="icon-badge">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 1.343-3 3 0 1.306.835 2.418 2 2.83V18h2v-4.17a3.001 3.001 0 00-1-5.83z"
                    />
                  </svg>
                </span>
                <p className="eyebrow">Researching Problems</p>
              </div>
              <ProspectAccordion prospects={brandData.prospects} />
              <div className="mt-6">
                <VizSummaryView prospects={brandData.prospects} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Power Wielding Section */}
    </GlassPanel>
  );
}

type HintType = "no-posts" | "no-prospects" | "low-engagement" | null;

interface HintConfig {
  type: HintType;
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionHandler: () => void;
}

function HelpHintSection() {
  const { brand: brandData, allSourcedRedditPosts } = useBrand();
  const { openDrawer, addScrapeJob } = useScrapeJob();
  const [currentHint, setCurrentHint] = useState<HintType>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!brandData) return;

    console.log("HelpHintSection Debug:", {
      postsLength: allSourcedRedditPosts.length,
      prospectsLength: brandData.prospects?.length,
      prospects: brandData.prospects,
    });

    // Check conditions in priority order
    if (!brandData.prospects || brandData.prospects.length === 0) {
      setCurrentHint("no-prospects");
    } else if (allSourcedRedditPosts.length === 0) {
      setCurrentHint("no-posts");
    } else {
      // Check for low engagement (example: average score < 5)
      const avgScore =
        allSourcedRedditPosts.reduce(
          (acc, post) => acc + (post.score || 0),
          0
        ) / (allSourcedRedditPosts.length || 1);
      if (avgScore < 5) {
        setCurrentHint("low-engagement");
      } else {
        setCurrentHint(null);
      }
    }
  }, [brandData, allSourcedRedditPosts]);

  const handleScrapeAllProspects = useCallback(() => {
    if (!brandData || !brandData.prospects) return;

    const scrapeJobs: ScrapeJob[] = brandData.prospects.map((prospect) => ({
      prospectId: prospect.id,
      brandName: brandData.name,
      problemToSolve: prospect.problem_to_solve,
      keywords: prospect.keywords || [],
      numPosts: 50, // Default number of posts per prospect
    }));

    // Open drawer with the jobs
    openDrawer(scrapeJobs);
  }, [brandData, openDrawer]);

  const hints: Record<HintType, Omit<HintConfig, "type">> = {
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
  };

  if (!currentHint || !hints[currentHint]) return null;

  const hintConfig = hints[currentHint];

  return (
    <AnimatePresence>
      {!isMinimized && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="rounded-lg p-3 relative"
            style={{
              background: "rgba(249, 115, 22, 0.03)",
              border: "1px dashed rgba(249, 115, 22, 0.3)",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setIsMinimized(true)}
              className="absolute top-2 right-2 p-1 rounded hover:bg-white/5 transition-colors"
            >
              <svg
                className="w-3 h-3 text-white/40"
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

            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400/80">
                  <div className="scale-75">{hintConfig.icon}</div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex items-center justify-between pr-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-orange-400/90">
                      💡 Hint
                    </span>
                    <h3 className="text-xs font-semibold text-white/80">
                      {hintConfig.title}
                    </h3>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {hintConfig.description}
                  </p>
                </div>

                {/* Action Button - smaller, outline style */}
                <button
                  onClick={hintConfig.actionHandler}
                  className="ml-4 px-3 py-1.5 rounded-md border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500/50 transition-all text-xs font-medium text-orange-400 hover:text-orange-300 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>{hintConfig.actionLabel}</span>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
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

export default function DiscoverPage() {
  useSession();

  return (
    <ProspectProvider>
      <KeywordQueueProvider>
        <DiscoverContent />
      </KeywordQueueProvider>
    </ProspectProvider>
  );
}
