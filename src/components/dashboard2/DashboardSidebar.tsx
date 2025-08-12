import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UseCase } from "@/types/brand";

interface DashboardSidebarProps {
  useCases?: UseCase[];
  selectedUseCase?: UseCase | null;
  onUseCaseSelect?: (useCase: UseCase | null) => void;
  onlyUnread?: boolean;
  setOnlyUnread?: (value: boolean) => void;
  onAddUseCase?: (title: string) => Promise<void> | void;
}

const getUseCaseIcon = (title: string) => {
  // Simple icon mapping based on use case title
  if (
    title.toLowerCase().includes("support") ||
    title.toLowerCase().includes("help")
  ) {
    return (
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
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }
  if (
    title.toLowerCase().includes("integration") ||
    title.toLowerCase().includes("api")
  ) {
    return (
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
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    );
  }
  // Default icon
  return (
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
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  );
};

export default function DashboardSidebar({
  useCases = [],
  selectedUseCase,
  onUseCaseSelect,
  onlyUnread = false,
  setOnlyUnread,
  onAddUseCase,
}: DashboardSidebarProps) {
  const [isResearchExpanded, setIsResearchExpanded] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  // Determine which section is active based on the current path
  const isResearchActive =
    pathname === "/dashboard" ||
    (pathname.startsWith("/dashboard/") &&
      !pathname.startsWith("/dashboard/engage"));
  const isEngageActive = pathname.startsWith("/dashboard/engage");

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

  return (
    <aside
      className="h-full flex flex-col"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <div className="px-4 py-4 space-y-2">
          {/* Research Section */}
          <div>
            <button
              onClick={() => {
                if (pathname !== "/dashboard") {
                  router.push("/dashboard");
                } else {
                  setIsResearchExpanded(!isResearchExpanded);
                }
              }}
              className="w-full flex items-center justify-between p-3 text-white hover:text-white/90 rounded-xl transition-all duration-300"
              style={{
                background: isResearchActive
                  ? "rgba(168, 85, 247, 0.15)"
                  : "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: `1px solid ${
                  isResearchActive
                    ? "rgba(168, 85, 247, 0.3)"
                    : "rgba(255, 255, 255, 0.1)"
                }`,
              }}
              onMouseEnter={(e) => {
                if (!isResearchActive) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isResearchActive) {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.05)";
                }
              }}
            >
              <div className="flex items-center gap-2">
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span className="font-heading font-bold tracking-wide">
                  Research
                </span>
              </div>
              {isResearchActive && (
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isResearchExpanded ? "rotate-90" : ""
                  }`}
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
              )}
            </button>

            {/* Research Dropdown Content - Only show on Research page */}
            {isResearchActive && isResearchExpanded && useCases.length > 0 && (
              <div className="mt-2 ml-4 space-y-2">
                {/* Use Cases Count */}
                <div className="text-white/80 font-body text-sm px-3 py-1">
                  Exploring {useCases.length} Use Cases
                </div>

                {/* Use Cases List */}
                <div className="space-y-1">
                  {/* Total Tab */}
                  <button
                    key="__total__"
                    onClick={() => onUseCaseSelect?.(null)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-300 text-sm ${
                      !selectedUseCase
                        ? "text-white"
                        : "text-white/70 hover:text-white"
                    }`}
                    style={{
                      background: !selectedUseCase
                        ? "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(34, 197, 94, 0.3))"
                        : "rgba(255, 255, 255, 0.03)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedUseCase) {
                        e.currentTarget.style.background =
                          "rgba(255, 255, 255, 0.08)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedUseCase) {
                        e.currentTarget.style.background =
                          "rgba(255, 255, 255, 0.03)";
                      }
                    }}
                  >
                    <div className="flex-shrink-0">
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
                          d="M3 12h18M3 7h18M3 17h18"
                        />
                      </svg>
                    </div>
                    <span className="flex-1 text-left font-body">Total</span>
                  </button>

                  {useCases.map((useCase) => (
                    <button
                      key={useCase.id}
                      onClick={() => onUseCaseSelect?.(useCase)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-300 text-sm ${
                        selectedUseCase?.id === useCase.id
                          ? "text-white"
                          : "text-white/70 hover:text-white"
                      }`}
                      style={{
                        background:
                          selectedUseCase?.id === useCase.id
                            ? "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(34, 197, 94, 0.3))"
                            : "rgba(255, 255, 255, 0.03)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedUseCase?.id !== useCase.id) {
                          e.currentTarget.style.background =
                            "rgba(255, 255, 255, 0.08)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedUseCase?.id !== useCase.id) {
                          e.currentTarget.style.background =
                            "rgba(255, 255, 255, 0.03)";
                        }
                      }}
                    >
                      <div className="flex-shrink-0">
                        {getUseCaseIcon(useCase.title)}
                      </div>
                      <span className="flex-1 text-left font-body">
                        {useCase.title}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Add Use Case */}
                {!isAdding ? (
                  <button
                    className="w-full flex items-center gap-2 p-2 text-white/60 hover:text-white rounded-lg transition-all duration-300 text-sm"
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.03)";
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
                    <span className="font-body">Add Research Topic</span>
                  </button>
                ) : (
                  <div
                    className="w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-300 text-sm"
                    style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    <div className="flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-white/70"
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
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={() => void submitNewUseCase()}
                      disabled={isSubmitting}
                      placeholder="Describe a research topic (e.g. pricing for B2B SaaS)"
                      className="flex-1 bg-transparent outline-none text-white placeholder-white/40 font-body"
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
            )}
          </div>

          {/* Engage Section */}
          <button
            onClick={() => router.push("/dashboard/engage")}
            className="w-full flex items-center gap-2 p-3 text-white/70 hover:text-white rounded-xl transition-all duration-300"
            style={{
              background: isEngageActive
                ? "rgba(34, 197, 94, 0.15)"
                : "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: `1px solid ${
                isEngageActive
                  ? "rgba(34, 197, 94, 0.3)"
                  : "rgba(255, 255, 255, 0.1)"
              }`,
            }}
            onMouseEnter={(e) => {
              if (!isEngageActive) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isEngageActive) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }
            }}
          >
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="font-heading font-bold tracking-wide">Engage</span>
          </button>

          {/* Settings Section */}
          <button
            onClick={() => router.push("/dashboard/settings")}
            className="w-full flex items-center gap-2 p-3 text-white/70 hover:text-white rounded-xl transition-all duration-300"
            style={{
              background: pathname.startsWith("/dashboard/settings")
                ? "rgba(239, 68, 68, 0.15)"
                : "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: `1px solid ${
                pathname.startsWith("/dashboard/settings")
                  ? "rgba(239, 68, 68, 0.3)"
                  : "rgba(255, 255, 255, 0.1)"
              }`,
            }}
            onMouseEnter={(e) => {
              if (!pathname.startsWith("/dashboard/settings")) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (!pathname.startsWith("/dashboard/settings")) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }
            }}
          >
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-heading font-bold tracking-wide">
              Settings
            </span>
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Fixed Filter Toggle at Bottom - Only show on Research page */}
        {isResearchActive && setOnlyUnread && (
          <div className="px-4 py-4 border-t border-white/10">
            <div
              className="p-4 rounded-xl"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyUnread}
                  onChange={(e) => setOnlyUnread(e.target.checked)}
                  className="w-4 h-4 rounded border-white/30 bg-white/10 text-purple-400 focus:ring-purple-400 focus:ring-offset-0"
                />
                <span className="font-body text-sm text-white/80">
                  Only show unread
                </span>
              </label>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
