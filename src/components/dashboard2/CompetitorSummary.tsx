interface CompetitorSummaryProps {
  summary: string;
  hotFeatures?: string | null;
}

export default function CompetitorSummary({ summary, hotFeatures }: CompetitorSummaryProps) {
  return (
    <div 
      className="rounded-2xl p-6 space-y-4"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
      }}
    >
      <div>
        <h3 className="text-xl font-heading font-bold text-white mb-3 tracking-wide">
          Competitor Summary
        </h3>
        <p className="text-white/90 font-body text-sm leading-relaxed">{summary}</p>
      </div>
      
      {hotFeatures && (
        <div className="pt-4 border-t border-white/20">
          <h4 className="text-lg font-heading font-semibold text-white mb-3 tracking-wide">
            Hot Features Summary
          </h4>
          <div className="text-white/90 font-body text-sm leading-relaxed whitespace-pre-wrap">
            {hotFeatures}
          </div>
        </div>
      )}
    </div>
  );
}