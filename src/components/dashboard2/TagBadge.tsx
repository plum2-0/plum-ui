interface TagBadgeProps {
  label: string;
  variant?: 'negative' | 'neutral' | 'positive' | 'competitor' | 'customer' | 'default';
}

export default function TagBadge({ label, variant = 'default' }: TagBadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'neutral':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'competitor':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'customer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'negative':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
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
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getVariantStyles()}`}>
      {getIcon()}
      {label}
    </span>
  );
}