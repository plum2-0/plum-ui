import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UseCase } from "@/types/brand";
import { PlumSproutLogo } from "@/components/PlumSproutLogo";
import SidebarBottomSection from "./SidebarBottomSection";

interface DashboardSidebarProps {
  brandName?: string;
  useCases?: UseCase[];
  selectedUseCase?: UseCase | null;
  onUseCaseSelect?: (useCase: UseCase | null) => void;
  onlyUnread?: boolean;
  setOnlyUnread?: (value: boolean) => void;
  onAddUseCase?: (title: string) => Promise<void> | void;
}

const getUseCaseIcon = () => {
  // Always use a briefcase icon for use cases to be consistent with panel headers
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
        d="M8 7V6a2 2 0 012-2h4a2 2 0 012 2v1m-1 0h1a2 2 0 012 2v9a 2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h1m10 0H7"
      />
    </svg>
  );
};

export default function DashboardSidebar({
  brandName = "Total",
  useCases = [],
  selectedUseCase,
  onUseCaseSelect,
  onlyUnread = false,
  setOnlyUnread,
  onAddUseCase,
}: DashboardSidebarProps) {
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
      !pathname.startsWith("/dashboard/settings"));

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
        <div className="px-4 py-4 space-y-2 flex-1 overflow-y-auto">
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
            <div className="flex-shrink-0">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <span className="flex-1 text-left font-heading font-bold tracking-wide">
              {brandName}
            </span>
          </button>

          <div className="border-t border-white/10"></div>

          {/* Use Cases List */}
          <div className="space-y-1">
            {useCases.map((useCase) => (
              <button
                key={useCase.id}
                onClick={() => onUseCaseSelect?.(useCase)}
                className={`w-full flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ${
                  selectedUseCase?.id === useCase.id
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                }`}
                style={{
                  background:
                    selectedUseCase?.id === useCase.id
                      ? "rgba(168, 85, 247, 0.15)"
                      : "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: `1px solid ${
                    selectedUseCase?.id === useCase.id
                      ? "rgba(168, 85, 247, 0.3)"
                      : "rgba(255, 255, 255, 0.1)"
                  }`,
                }}
                onMouseEnter={(e) => {
                  if (selectedUseCase?.id !== useCase.id) {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedUseCase?.id !== useCase.id) {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)";
                  }
                }}
              >
                <div className="flex-shrink-0">{getUseCaseIcon()}</div>
                <span className="flex-1 text-left font-body text-sm">
                  {useCase.title}
                </span>
              </button>
            ))}

            {/* Add Use Case Button */}
            {!isAdding ? (
              <button
                className="w-full flex items-center gap-2 p-3 text-white/60 hover:text-white rounded-xl transition-all duration-300"
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
                  className="w-5 h-5"
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
                <span className="font-body text-sm">Add Research Topic</span>
              </button>
            ) : (
              <div
                className="w-full flex items-center gap-2 p-3 rounded-xl transition-all duration-300"
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-white/70"
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
                  placeholder="Describe a problem you want to validate"
                  className="flex-1 bg-transparent outline-none text-white placeholder-white/40 font-body text-sm"
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
        <div className="flex-1"></div>

        <SidebarBottomSection />
      </div>
    </aside>
  );
}
