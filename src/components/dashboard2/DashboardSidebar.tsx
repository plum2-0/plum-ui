import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Prospect } from "@/types/brand";
import { PlumSproutLogo } from "@/components/PlumSproutLogo";
import SidebarBottomSection from "./SidebarBottomSection";
import MobileSidebarWrapper from "@/components/shared/MobileSidebarWrapper";

interface DashboardSidebarProps {
  brandName?: string;
  prospects?: Prospect[];
  selectedUseCase?: Prospect | null;
  onUseCaseSelect?: (prospect: Prospect | null) => void;
  onlyUnread?: boolean;
  setOnlyUnread?: (value: boolean) => void;
  onAddUseCase?: (title: string) => Promise<void> | void;
}

export default function DashboardSidebar({
  brandName = "Total",
  prospects = [],
  selectedUseCase,
  onUseCaseSelect,
  onlyUnread = false,
  setOnlyUnread,
  onAddUseCase,
}: DashboardSidebarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

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
    <aside
      className="h-full flex flex-col w-full md:w-64"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section at Top */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-xl"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
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
        <div className="px-4 py-4 space-y-2 h-[70%] overflow-y-auto">
          {/* Brand Total View */}
          <button
            onClick={() => onUseCaseSelect?.(null)}
            className={`w-full flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ${
              !selectedUseCase ? "text-white" : "text-white/70 hover:text-white"
            }`}
            style={{
              background: !selectedUseCase
                ? "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(34, 197, 94, 0.15))"
                : "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: `1px solid ${
                !selectedUseCase
                  ? "rgba(168, 85, 247, 0.3)"
                  : "rgba(255, 255, 255, 0.1)"
              }`,
            }}
            onMouseEnter={(e) => {
              if (selectedUseCase) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedUseCase) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="flex-1 text-left font-heading font-bold tracking-wide">
              {brandName}
            </span>
          </button>

          <div className="border-t border-white/10"></div>

          {/* Use Case Summary */}
          <button
            onClick={() => router.push("/dashboard/use-case-summary")}
            className="w-full flex items-center gap-2 p-3 rounded-xl transition-all duration-300 text-white/70 hover:text-white"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
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
            <span className="flex-1 text-left font-body text-sm">
              Prospect Summary
            </span>
          </button>

          {/* Use Cases List (indented with connector) */}
          <div className="space-y-1 ml-2 pl-3 border-l border-white/10">
            {prospects.map((prospect) => (
              <div key={prospect.id} className="relative">
                <button
                  onClick={() => onUseCaseSelect?.(prospect)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-300 ${
                    selectedUseCase?.id === prospect.id
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                  style={{
                    background:
                      selectedUseCase?.id === prospect.id
                        ? "rgba(168, 85, 247, 0.15)"
                        : "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${
                      selectedUseCase?.id === prospect.id
                        ? "rgba(168, 85, 247, 0.3)"
                        : "rgba(255, 255, 255, 0.1)"
                    }`,
                  }}
                  onMouseEnter={(e) => {
                    if (selectedUseCase?.id !== prospect.id) {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedUseCase?.id !== prospect.id) {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.05)";
                    }
                  }}
                >
                  <span className="flex-1 text-left font-body text-xs">
                    {prospect?.problem_to_solve}
                  </span>
                </button>
              </div>
            ))}

            {/* Add Use Case Button */}
            {!isAdding ? (
              <button
                className="w-full flex items-center gap-2 p-2 text-white/60 hover:text-white rounded-lg transition-all duration-300"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.05)";
                }}
                onClick={() => setIsAdding(true)}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="font-body text-xs">Add Research Topic</span>
              </button>
            ) : (
              <div
                className="w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-300"
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => void submitNewUseCase()}
                  disabled={isSubmitting}
                  placeholder="Describe a problem you want to validate"
                  className="flex-1 bg-transparent outline-none text-white placeholder-white/40 font-body text-xs"
                />
                {isSubmitting && (
                  <svg
                    className="w-4 h-4 animate-spin text-white/70"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 "></div>

        <SidebarBottomSection />
      </div>
    </aside>
  );

  return <MobileSidebarWrapper>{sidebarContent}</MobileSidebarWrapper>;
}
