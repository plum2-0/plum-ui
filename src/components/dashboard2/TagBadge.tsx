interface TagBadgeProps {
  label: string;
  variant: 'negative' | 'positive' | 'neutral' | 'competitor' | 'customer' | 'default';
}

export default function TagBadge({ label, variant = 'default' }: TagBadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'negative':
        return {
          background: 'rgba(239, 68, 68, 0.2)',
          color: 'white',
        };
      case 'positive':
        return {
          background: 'rgba(34, 197, 94, 0.2)',
          color: 'white',
        };
      case 'neutral':
        return {
          background: 'rgba(156, 163, 175, 0.2)',
          color: 'white',
        };
      case 'competitor':
        return {
          background: 'rgba(251, 146, 60, 0.2)',
          color: 'white',
        };
      case 'customer':
        return {
          background: 'rgba(59, 130, 246, 0.2)',
          color: 'white',
        };
      default:
        return {
          background: 'rgba(168, 85, 247, 0.2)',
          color: 'white',
        };
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
      case 'positive':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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

  const styles = getVariantStyles();

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-body font-medium rounded-md`}
      style={{
        background: styles.background,
        color: styles.color,
      }}
    >
      {getIcon()}
      <span>{label}</span>
    </span>
  );
}