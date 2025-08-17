import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Problems } from "@/types/brand";
import { PlumSproutLogo } from "@/components/PlumSproutLogo";
import SidebarBottomSection from "./SidebarBottomSection";

interface DashboardSidebarProps {
  brandName?: string;
  problems?: Problems[];
  selectedUseCase?: Problems | null;
  onUseCaseSelect?: (problem: Problems | null) => void;
  onlyUnread?: boolean;
  setOnlyUnread?: (value: boolean) => void;
  onAddUseCase?: (title: string) => Promise<void> | void;
}

export default function DashboardSidebar({
  brandName = "Total",
  problems = [],
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
            <span className="flex-1 text-left font-heading font-bold tracking-wide">
              {brandName}
            </span>
          </button>

          <div className="border-t border-white/10"></div>

          {/* Use Cases List */}
          <div className="space-y-1">
            {problems.map((problem) => (
              <button
                key={problem.id}
                onClick={() => onUseCaseSelect?.(problem)}
                className={`w-full flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ${
                  selectedUseCase?.id === problem.id
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                }`}
                style={{
                  background:
                    selectedUseCase?.id === problem.id
                      ? "rgba(168, 85, 247, 0.15)"
                      : "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: `1px solid ${
                    selectedUseCase?.id === problem.id
                      ? "rgba(168, 85, 247, 0.3)"
                      : "rgba(255, 255, 255, 0.1)"
                  }`,
                }}
                onMouseEnter={(e) => {
                  if (selectedUseCase?.id !== problem.id) {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedUseCase?.id !== problem.id) {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)";
                  }
                }}
              >
                <span className="flex-1 text-left font-body text-sm">
                  {problem?.problem}
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
        <div className="flex-1 "></div>

        <SidebarBottomSection />
      </div>
    </aside>
  );
}
