import { UseCase } from "@/types/brand";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

interface UseCasesSidebarProps {
  useCases: UseCase[];
  selectedUseCase: UseCase | null;
  onUseCaseSelect: (useCase: UseCase) => void;
  onlyUnread: boolean;
  setOnlyUnread: (value: boolean) => void;
}

// Icon components for different use case types
const getUseCaseIcon = (title: string) => {
  if (title.toLowerCase().includes("documentation")) {
    return (
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  }
  if (title.toLowerCase().includes("api")) {
    return (
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
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    );
  }
  return (
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
  );
};

export default function UseCasesSidebar({
  useCases,
  selectedUseCase,
  onUseCaseSelect,
  onlyUnread,
  setOnlyUnread,
}: UseCasesSidebarProps) {
  return (
    <aside className="w-64 bg-white/5 backdrop-blur-sm p-4 h-full overflow-auto">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
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
            UseCases
          </h2>
        </div>

        {/* Use Cases Count */}
        <div className="text-purple-200 text-sm mb-4">
          {useCases.length} Use Cases Found:
        </div>

        {/* Use Cases List */}
        <div className="space-y-2">
          {useCases.map((useCase) => (
            <button
              key={useCase.id}
              onClick={() => onUseCaseSelect(useCase)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                selectedUseCase?.id === useCase.id
                  ? "bg-purple-600/30 text-white"
                  : "text-purple-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="flex-shrink-0">
                {getUseCaseIcon(useCase.title)}
              </div>
              <span className="flex-1 text-left text-sm">{useCase.title}</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Add Use Case Button */}
        <button className="w-full flex items-center gap-2 p-3 text-purple-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
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
          <span className="text-sm">Add Use Case</span>
        </button>
      </div>
    </aside>
  );
}
