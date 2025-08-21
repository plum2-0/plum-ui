import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import GlassPanel from "@/components/ui/GlassPanel";
import { Prospect } from "@/types/brand";
import { PlumSproutLogo } from "@/components/PlumSproutLogo";
import SidebarBottomSection from "./SidebarBottomSection";
import MobileSidebarWrapper from "@/components/shared/MobileSidebarWrapper";
import { useBrand } from "@/contexts/BrandContext";

interface DashboardSidebarProps {
  selectedUseCase?: Prospect | null;
  onUseCaseSelect?: (prospect: Prospect | null) => void;
  onlyUnread?: boolean;
  setOnlyUnread?: (value: boolean) => void;
  onAddUseCase?: (title: string) => Promise<void> | void;
  inlineSelection?: boolean; // New prop to disable navigation
}

export default function DashboardSidebar({
  selectedUseCase,
  onUseCaseSelect,
  onlyUnread = false,
  setOnlyUnread,
  onAddUseCase,
  inlineSelection = false,
}: DashboardSidebarProps) {
  const { brand } = useBrand();
  const brandName = brand?.name || "Total";
  const prospects = brand?.prospects || [];
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const submitNewUseCase = async () => {
    if (!onAddUseCase) return;
    const title = newTitle.trim();
    if (!title || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onAddUseCase(title);
      setNewTitle("");
      setIsAdding(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void submitNewUseCase();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsAdding(false);
      setNewTitle("");
    }
  };

  const sidebarContent = (
    <GlassPanel
      as="aside"
      className="h-full flex flex-col w-full md:w-64"
      variant="light"
      style={{
        borderRight: "1px solid rgba(255, 255, 255, 0.15)",
        background:
          "linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
      }}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section at Top */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-xl"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.06) 100%)",
                backdropFilter: "blur(20px) saturate(1.2)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow:
                  "0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
              }}
            >
              <PlumSproutLogo className="w-5 h-5" />
            </div>
            <span className="font-heading text-sm font-bold text-white tracking-wide">
              PlumSprout
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-4 py-4 space-y-2 flex-1 overflow-y-auto">
          {/* Prospect Summary */}
          <div className="space-y-2">
            <button
              onClick={() => router.push("/dashboard/discover")}
              className={`w-full flex items-center gap-2 p-3 rounded-xl transition-all duration-300 transform-gpu ${
                pathname === "/dashboard/discover"
                  ? "text-white"
                  : "text-white/70 hover:text-white"
              }`}
              style={{
                background:
                  pathname === "/dashboard/discover"
                    ? "linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(34, 197, 94, 0.12) 50%, rgba(168, 85, 247, 0.08) 100%)"
                    : "linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
                backdropFilter: "blur(20px) saturate(1.2)",
                WebkitBackdropFilter: "blur(20px) saturate(1.2)",
                border:
                  pathname === "/dashboard/discover"
                    ? "1px solid rgba(168, 85, 247, 0.2)"
                    : "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow:
                  pathname === "/dashboard/discover"
                    ? "0 8px 32px rgba(168, 85, 247, 0.15), 0 4px 16px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.1)"
                    : "0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
                transform:
                  pathname === "/dashboard/discover"
                    ? "translateY(-1px)"
                    : "translateY(0)",
              }}
              onMouseEnter={(e) => {
                if (pathname !== "/dashboard/discover") {
                  e.currentTarget.style.background =
                    "linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(0, 0, 0, 0.15), 0 3px 10px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== "/dashboard/discover") {
                  e.currentTarget.style.background =
                    "linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)";
                }
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(1px)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 3px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
              }}
              onMouseUp={(e) => {
                if (pathname !== "/dashboard/discover") {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(0, 0, 0, 0.15), 0 3px 10px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.08)";
                } else {
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
            >
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="flex-1 text-left font-heading font-bold tracking-wide">
                Discover
              </span>
            </button>

            {/* Use Cases List (indented with connector) */}
            <div className="space-y-1 ml-2 pl-3 border-l border-white/10">
              {/* Add Use Case Button */}
            </div>
          </div>

          <button
            onClick={() => router.push("/swipe")}
            className={`w-full flex items-center gap-2 p-3 rounded-xl transition-all duration-300 transform-gpu ${
              pathname === "/swipe"
                ? "text-white"
                : "text-white/70 hover:text-white"
            }`}
            style={{
              background:
                pathname === "/swipe"
                  ? "linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(34, 197, 94, 0.12) 50%, rgba(168, 85, 247, 0.08) 100%)"
                  : "linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
              backdropFilter: "blur(20px) saturate(1.2)",
              WebkitBackdropFilter: "blur(20px) saturate(1.2)",
              border:
                pathname === "/swipe"
                  ? "1px solid rgba(168, 85, 247, 0.2)"
                  : "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow:
                pathname === "/swipe"
                  ? "0 8px 32px rgba(168, 85, 247, 0.15), 0 4px 16px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.1)"
                  : "0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
              transform:
                pathname === "/swipe" ? "translateY(-1px)" : "translateY(0)",
            }}
            onMouseEnter={(e) => {
              if (pathname !== "/swipe") {
                e.currentTarget.style.background =
                  "linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(0, 0, 0, 0.15), 0 3px 10px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.08)";
              }
            }}
            onMouseLeave={(e) => {
              if (pathname !== "/swipe") {
                e.currentTarget.style.background =
                  "linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)";
              }
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "translateY(1px)";
              e.currentTarget.style.boxShadow =
                "0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 3px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
            }}
            onMouseUp={(e) => {
              if (pathname !== "/swipe") {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(0, 0, 0, 0.15), 0 3px 10px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.08)";
              } else {
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
            <span className="flex-1 text-left font-heading font-bold tracking-wide">
              Select
            </span>
          </button>

          {/* Engaged Section - Right underneath Select */}
          <button
            onClick={() => router.push("/dashboard/engage")}
            className={`w-full flex items-center gap-2 p-3 rounded-xl transition-all duration-300 transform-gpu ${
              pathname === "/dashboard/engage"
                ? "text-white"
                : "text-white/70 hover:text-white"
            }`}
            style={{
              background:
                pathname === "/dashboard/engage"
                  ? "linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(34, 197, 94, 0.12) 50%, rgba(168, 85, 247, 0.08) 100%)"
                  : "linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
              backdropFilter: "blur(20px) saturate(1.2)",
              WebkitBackdropFilter: "blur(20px) saturate(1.2)",
              border:
                pathname === "/dashboard/engage"
                  ? "1px solid rgba(168, 85, 247, 0.2)"
                  : "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow:
                pathname === "/dashboard/engage"
                  ? "0 8px 32px rgba(168, 85, 247, 0.15), 0 4px 16px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.1)"
                  : "0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
              transform:
                pathname === "/dashboard/engage"
                  ? "translateY(-1px)"
                  : "translateY(0)",
            }}
            onMouseEnter={(e) => {
              if (pathname !== "/dashboard/engage") {
                e.currentTarget.style.background =
                  "linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(0, 0, 0, 0.15), 0 3px 10px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.08)";
              }
            }}
            onMouseLeave={(e) => {
              if (pathname !== "/dashboard/engage") {
                e.currentTarget.style.background =
                  "linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)";
              }
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "translateY(1px)";
              e.currentTarget.style.boxShadow =
                "0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 3px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
            }}
            onMouseUp={(e) => {
              if (pathname !== "/dashboard/engage") {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(0, 0, 0, 0.15), 0 3px 10px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.08)";
              } else {
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="flex-1 text-left font-heading font-bold tracking-wide">
              Engaged
            </span>
          </button>

          {/* Spacer to push SidebarBottomSection to bottom */}
          <div className="flex-1"></div>
        </div>

        <SidebarBottomSection />
      </div>
    </GlassPanel>
  );

  return <MobileSidebarWrapper>{sidebarContent}</MobileSidebarWrapper>;
}
