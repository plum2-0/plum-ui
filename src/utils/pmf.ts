export type FunnelTotals = {
  total_posts_scraped?: number;
  total_leads_discovered?: number; // same as total_posts_tagged
  total_leads_engaged?: number;
  total_leads_converted?: number;
  total_leads_dropped?: number;
};

export type PMFStatus = "GOOD" | "AVG" | "BAD";

export const DISCOVERY_GOOD_THRESHOLD = 0.1; // discovered / scraped
export const ENGAGEMENT_GOOD_THRESHOLD = 0.1; // engaged / discovered

export type PMFEval = {
  pmf_status: PMFStatus;
  score: number; // 0-100
  metrics: {
    discovery_rate: number; // discovered / scraped
    engagement_rate: number; // engaged / discovered
    engaged_over_scraped: number; // engaged / scraped
    conversion_rate: number; // converted / engaged
    drop_rate: number; // dropped / engaged
    volume: number; // volume gate in [0,1]
  };
  reasons: string[];
};

export function evaluateProspectPMF(f: FunnelTotals): PMFEval {
  const s = 0.5;
  const S = 1;

  const scraped = Math.max(0, f.total_posts_scraped ?? 0);
  const discovered = Math.max(0, f.total_leads_discovered ?? 0);
  const engaged = Math.max(0, f.total_leads_engaged ?? 0);
  const converted = Math.max(0, f.total_leads_converted ?? 0);
  const dropped = Math.max(0, f.total_leads_dropped ?? 0);

  const discovery_rate = (discovered + s) / (scraped + S);
  const engagement_rate = (engaged + s) / (discovered + S);
  const engaged_over_scraped = (engaged + s) / (scraped + S);
  const conversion_rate = (converted + s) / (engaged + S);
  const drop_rate = (dropped + s) / (engaged + S);

  // Volume gate: require some scraped volume and discovered volume
  const volume = Math.min(1, discovered / 30, scraped / 200);

  // Heavier emphasis on discovery and engagement relative to scraped
  let score =
    100 *
    (0.45 * discovery_rate +
      0.35 * engaged_over_scraped +
      0.12 * conversion_rate +
      0.08 * (1 - drop_rate)) *
    volume;

  score = Math.max(0, Math.min(100, score));

  let pmf_status: PMFStatus = "AVG";
  // GOOD if both discovery and engagement thresholds are met at reasonable volume,
  // or if overall score is high at volume
  if (
    (discovery_rate >= DISCOVERY_GOOD_THRESHOLD &&
      engagement_rate >= ENGAGEMENT_GOOD_THRESHOLD &&
      discovered >= 30) ||
    (score >= 75 && discovered >= 30)
  ) {
    pmf_status = "GOOD";
  } else if (score < 40 || (drop_rate >= 0.6 && engaged >= 10)) {
    pmf_status = "BAD";
  }

  const reasons: string[] = [];
  if (pmf_status === "GOOD") reasons.push("Discovery and engagement exceed 10% thresholds at sufficient volume");
  if (pmf_status !== "GOOD" && discovered < 30) reasons.push("Low discovery volume (needs ≥ 30)");
  if (discovery_rate < DISCOVERY_GOOD_THRESHOLD) reasons.push("Discovery per scraped posts below 10%");
  if (engagement_rate < ENGAGEMENT_GOOD_THRESHOLD) reasons.push("Engagement per discovered leads below 10%");
  if (conversion_rate < 0.1) reasons.push("Low conversion rate (< 10%)");
  if (drop_rate >= 0.6 && engaged >= 10) reasons.push("High drop rate (≥ 60%) at meaningful volume");

  return {
    pmf_status,
    score: Number(score.toFixed(1)),
    metrics: {
      discovery_rate: Number(discovery_rate.toFixed(3)),
      engagement_rate: Number(engagement_rate.toFixed(3)),
      engaged_over_scraped: Number(engaged_over_scraped.toFixed(3)),
      conversion_rate: Number(conversion_rate.toFixed(3)),
      drop_rate: Number(drop_rate.toFixed(3)),
      volume: Number(volume.toFixed(3)),
    },
    reasons,
  };
} 