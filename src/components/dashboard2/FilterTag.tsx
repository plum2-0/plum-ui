interface FilterTagProps {
  label: string;
  count: number;
  isSelected: boolean;
  variant: 'competitor' | 'customer' | 'default';
  onClick: () => void;
}

export default function FilterTag({ 
  label, 
  count, 
  isSelected, 
  variant, 
  onClick 
}: FilterTagProps) {
  const getVariantStyles = () => {
    if (isSelected) {
      switch (variant) {
        case 'competitor':
          return 'bg-orange-500 text-white border-orange-500';
        case 'customer':
          return 'bg-blue-500 text-white border-blue-500';
        default:
          return 'bg-purple-500 text-white border-purple-500';
      }
    } else {
      switch (variant) {
        case 'competitor':
          return 'bg-transparent text-orange-400 border-orange-400 hover:bg-orange-400/10';
        case 'customer':
          return 'bg-transparent text-blue-400 border-blue-400 hover:bg-blue-400/10';
        default:
          return 'bg-transparent text-purple-400 border-purple-400 hover:bg-purple-400/10';
      }
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'competitor':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'customer':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all ${getVariantStyles()}`}
    >
      {getIcon()}
      <span>{label}</span>
      <span className="opacity-75">({count})</span>
    </button>
  );
}