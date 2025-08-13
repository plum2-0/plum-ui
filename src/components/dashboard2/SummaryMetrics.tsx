interface SummaryMetricsProps {
  totalPosts: number;
  potentialCustomers: number;
  competitorMentions: number;
  ownMentions: number;
}

export default function SummaryMetrics({
  totalPosts,
  potentialCustomers,
  competitorMentions,
  ownMentions,
}: SummaryMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        className="p-4 rounded-xl"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="text-white/70 text-xs font-body mb-1">Total Posts</div>
        <div className="text-white text-2xl font-heading font-bold">
          {totalPosts}
        </div>
      </div>
      <div
        className="p-4 rounded-xl"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="text-white/70 text-xs font-body mb-1">
          Potential Customers
        </div>
        <div className="text-emerald-300 text-2xl font-heading font-bold">
          {potentialCustomers}
        </div>
      </div>
      <div
        className="p-4 rounded-xl"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="text-white/70 text-xs font-body mb-1">
          Competitor Mentions
        </div>
        <div className="text-rose-300 text-2xl font-heading font-bold">
          {competitorMentions}
        </div>
      </div>
      <div
        className="p-4 rounded-xl"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="text-white/70 text-xs font-body mb-1">Own Mentions</div>
        <div className="text-indigo-300 text-2xl font-heading font-bold">
          {ownMentions}
        </div>
      </div>
    </div>
  );
}
