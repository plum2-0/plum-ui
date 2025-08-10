import { useState } from "react";
import { useRouter } from "next/navigation";
import { UseCase } from "@/types/brand";

interface UseCasesSidebarProps {
  useCases: UseCase[];
  selectedUseCase: UseCase | null;
  onUseCaseSelect: (useCase: UseCase) => void;
  onlyUnread: boolean;
  setOnlyUnread: (value: boolean) => void;
}

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const getUseCaseIcon = (title: string) => {
  // Simple icon mapping based on use case title
  if (title.toLowerCase().includes("support") || title.toLowerCase().includes("help")) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (title.toLowerCase().includes("integration") || title.toLowerCase().includes("api")) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    );
  }
  // Default icon
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
};

export default function UseCasesSidebar({
  useCases,
  selectedUseCase,
  onUseCaseSelect,
  onlyUnread,
  setOnlyUnread,
}: UseCasesSidebarProps) {
  const [isResearchExpanded, setIsResearchExpanded] = useState(true);
  const router = useRouter();

  return (
    <aside 
      className="h-full flex flex-col"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <div className="px-4 py-4 space-y-2">
          {/* Research Section */}
          <div>
            <button
              onClick={() => setIsResearchExpanded(!isResearchExpanded)}
              className="w-full flex items-center justify-between p-3 text-white hover:text-white/90 rounded-xl transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
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
                <span className="font-heading font-bold tracking-wide">Research</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isResearchExpanded ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Research Dropdown Content */}
            {isResearchExpanded && (
              <div className="mt-2 ml-4 space-y-2">
                {/* Use Cases Count */}
                <div className="text-white/80 font-body text-sm px-3 py-1">
                  Exploring {useCases.length} Use Cases
                </div>

                {/* Use Cases List */}
                <div className="space-y-1">
                  {useCases.map((useCase) => (
                    <button
                      key={useCase.id}
                      onClick={() => onUseCaseSelect(useCase)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-300 text-sm ${
                        selectedUseCase?.id === useCase.id
                          ? "text-white"
                          : "text-white/70 hover:text-white"
                      }`}
                      style={{
                        background: selectedUseCase?.id === useCase.id 
                          ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(34, 197, 94, 0.3))'
                          : 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedUseCase?.id !== useCase.id) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedUseCase?.id !== useCase.id) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        }
                      }}
                    >
                      <div className="flex-shrink-0">
                        {getUseCaseIcon(useCase.title)}
                      </div>
                      <span className="flex-1 text-left font-body">{useCase.title}</span>
                    </button>
                  ))}
                </div>

                {/* Add Use Case Button */}
                <button 
                  className="w-full flex items-center gap-2 p-2 text-white/60 hover:text-white rounded-lg transition-all duration-300 text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-body">Add Research Topic</span>
                </button>
              </div>
            )}
          </div>

          {/* Engage Section */}
          <button
            onClick={() => router.push('/dashboard/engage')}
            className="w-full flex items-center gap-2 p-3 text-white/70 hover:text-white rounded-xl transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
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
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Fixed Filter Toggle at Bottom */}
        <div className="px-4 py-4 border-t border-white/10">
          <div 
            className="p-4 rounded-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyUnread}
                onChange={(e) => setOnlyUnread(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-white/10 text-purple-400 focus:ring-purple-400 focus:ring-offset-0"
              />
              <span className="font-body text-sm text-white/80">Only show unread</span>
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
}
