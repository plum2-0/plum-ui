interface CompetitorSummaryProps {
  summary: string;
  hotFeatures?: string | null;
}

export default function CompetitorSummary({ summary, hotFeatures }: CompetitorSummaryProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-white mb-3">Competitor Summary</h3>
        <p className="text-purple-100 text-sm leading-relaxed">{summary}</p>
      </div>
      
      {hotFeatures && (
        <div className="pt-4 border-t border-white/10">
          <h4 className="text-lg font-semibold text-white mb-3">Hot Features Summary</h4>
          <div className="text-purple-100 text-sm leading-relaxed whitespace-pre-wrap">
            {hotFeatures}
          </div>
        </div>
      )}
    </div>
  );
}