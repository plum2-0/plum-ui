interface UseCaseTabsProps {
  activeTab: 'posts' | 'insights';
  onTabChange: (tab: 'posts' | 'insights') => void;
  hasInsights: boolean;
}

export default function UseCaseTabs({ activeTab, onTabChange, hasInsights }: UseCaseTabsProps) {
  return (
    <div className="flex items-center gap-1 mb-6">
      <div 
        className="flex rounded-xl p-1"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <button
          onClick={() => onTabChange('posts')}
          className={`px-4 py-2 rounded-lg font-body font-medium text-sm transition-all duration-300 ${
            activeTab === 'posts' 
              ? 'text-white shadow-lg' 
              : 'text-white/60 hover:text-white/80'
          }`}
          style={{
            background: activeTab === 'posts' 
              ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(147, 51, 234, 0.8))'
              : 'transparent',
            boxShadow: activeTab === 'posts' 
              ? '0 4px 12px rgba(168, 85, 247, 0.3)'
              : 'none'
          }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Posts
          </div>
        </button>

        <button
          onClick={() => onTabChange('insights')}
          disabled={!hasInsights}
          className={`px-4 py-2 rounded-lg font-body font-medium text-sm transition-all duration-300 ${
            activeTab === 'insights' 
              ? 'text-white shadow-lg' 
              : hasInsights 
                ? 'text-white/60 hover:text-white/80'
                : 'text-white/30 cursor-not-allowed'
          }`}
          style={{
            background: activeTab === 'insights' 
              ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(147, 51, 234, 0.8))'
              : 'transparent',
            boxShadow: activeTab === 'insights' 
              ? '0 4px 12px rgba(168, 85, 247, 0.3)'
              : 'none'
          }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Insights
            {!hasInsights && (
              <span className="text-xs opacity-60">(N/A)</span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
} 