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
          return {
            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.95), rgba(249, 115, 22, 0.95))',
            color: 'white',
            borderColor: 'rgba(251, 146, 60, 0.8)',
            boxShadow: '0 4px 20px rgba(251, 146, 60, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          };
        case 'customer':
          return {
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95))',
            color: 'white',
            borderColor: 'rgba(59, 130, 246, 0.8)',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          };
        default:
          return {
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.95), rgba(147, 51, 234, 0.95))',
            color: 'white',
            borderColor: 'rgba(168, 85, 247, 0.8)',
            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          };
      }
    } else {
      switch (variant) {
        case 'competitor':
          return {
            background: 'rgba(251, 146, 60, 0.15)',
            color: 'rgba(251, 146, 60, 1)',
            borderColor: 'rgba(251, 146, 60, 0.5)',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          };
        case 'customer':
          return {
            background: 'rgba(59, 130, 246, 0.15)',
            color: 'rgba(59, 130, 246, 1)',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          };
        default:
          return {
            background: 'rgba(168, 85, 247, 0.15)',
            color: 'rgba(168, 85, 247, 1)',
            borderColor: 'rgba(168, 85, 247, 0.5)',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          };
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

  const styles = getVariantStyles();

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-body font-semibold rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg`}
      style={{
        background: styles.background,
        color: styles.color,
        borderColor: styles.borderColor,
        backdropFilter: 'blur(15px)',
        boxShadow: styles.boxShadow,
        textShadow: isSelected ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
      }}
    >
      {getIcon()}
      <span className="font-medium">{label}</span>
      <span 
        className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full" 
        style={{
          background: isSelected 
            ? 'rgba(255, 255, 255, 0.25)' 
            : 'rgba(255, 255, 255, 0.15)',
          color: isSelected ? 'white' : 'inherit',
          textShadow: isSelected ? '0 1px 1px rgba(0, 0, 0, 0.3)' : 'none',
        }}
      >
        {count}
      </span>
    </button>
  );
}