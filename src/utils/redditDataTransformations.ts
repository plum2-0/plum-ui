import { Prospect } from "@/types/brand";
import { format, fromUnixTime, addDays } from "date-fns";
import _ from "lodash";

export interface ProcessedPost {
  problem_id: string;
  problem_title: string;
  post_id: string;
  date: string;
  timestamp: number;
  score: number;
  reply_count: number;
  status: string;
  title: string;
  subreddit: string;
  permalink: string;
}

export interface DailyAggregate {
  date: string;
  problem_id: string;
  problem_title: string;
  post_count: number;
  cumulative_count?: number;
}

export interface ProblemSummary {
  problem_id: string;
  problem_title: string;
  total_posts: number;
  avg_daily_posts: number;
  date_range: { start: string; end: string };
  percentage_of_total: number;
}

export interface ProcessedData {
  flatPosts: ProcessedPost[];
  dailyAggregates: DailyAggregate[];
  problemSummaries: ProblemSummary[];
}

export type StatusFilter = "ACTIONED" | "ALL_ACTIVE";

export function processRedditData(
  prospects: Prospect[],
  statusFilter: StatusFilter
): ProcessedData {
  // Step 1: Filter and flatten
  const flatPosts = prospects.flatMap((problem) =>
    problem.sourced_reddit_posts
      .filter((post) => post.status !== "IGNORE")
      .filter((post) =>
        statusFilter === "ACTIONED"
          ? post.status === "REPLY" || post.status === "SUGGESTED_REPLY"
          : ["REPLY", "SUGGESTED_REPLY", "PENDING"].includes(post.status)
      )
      .map((post) => ({
        problem_id: problem.id,
        problem_title: problem.problem_to_solve,
        post_id: post.thing_id,
        date: format(fromUnixTime(post.created_utc), "yyyy-MM-dd"),
        timestamp: post.created_utc,
        score: post.score,
        reply_count: post.reply_count || 0,
        status: post.status,
        title: post.title || post.content.substring(0, 100),
        subreddit: post.subreddit,
        permalink: post.permalink,
      }))
  );

  // Step 2: Generate daily aggregates
  const dailyAggregates = generateDailyAggregates(flatPosts);

  // Step 3: Calculate summaries for radial chart
  const problemSummaries = calculateProblemSummaries(flatPosts);

  return { flatPosts, dailyAggregates, problemSummaries };
}

function generateDailyAggregates(posts: ProcessedPost[]): DailyAggregate[] {
  const grouped = _.groupBy(posts, (p) => `${p.date}|${p.problem_id}`);

  return Object.entries(grouped).map(([key, group]) => {
    const [date, problemId] = key.split("|");
    return {
      date,
      problem_id: problemId,
      problem_title: group[0].problem_title,
      post_count: group.length,
    };
  });
}

function calculateProblemSummaries(posts: ProcessedPost[]): ProblemSummary[] {
  const grouped = _.groupBy(posts, "problem_id");
  const totalPosts = posts.length;

  return Object.entries(grouped).map(([problemId, group]) => {
    const dates = group.map((p) => p.date);
    const uniqueDates = new Set(dates);
    const dateRange = {
      start: _.min(dates) || "",
      end: _.max(dates) || "",
    };

    return {
      problem_id: problemId,
      problem_title: group[0].problem_title,
      total_posts: group.length,
      avg_daily_posts: uniqueDates.size > 0 ? group.length / uniqueDates.size : 0,
      date_range: dateRange,
      percentage_of_total: totalPosts > 0 ? (group.length / totalPosts) * 100 : 0,
    };
  });
}

export function fillDateGaps(
  data: DailyAggregate[],
  startDate: Date,
  endDate: Date,
  problems: { id: string; title: string }[]
): DailyAggregate[] {
  const filled: DailyAggregate[] = [];
  const dateMap = new Map(data.map((d) => [`${d.date}-${d.problem_id}`, d]));

  for (let date = new Date(startDate); date <= endDate; date = addDays(date, 1)) {
    const dateStr = format(date, "yyyy-MM-dd");
    for (const problem of problems) {
      const key = `${dateStr}-${problem.id}`;
      const existing = dateMap.get(key);
      filled.push(
        existing || {
          date: dateStr,
          problem_id: problem.id,
          problem_title: problem.title,
          post_count: 0,
        }
      );
    }
  }

  return filled;
}

export function calculateCumulative(data: DailyAggregate[]): DailyAggregate[] {
  const sorted = _.sortBy(data, "date");
  const cumulative: Map<string, number> = new Map();

  return sorted.map((item) => {
    const current = cumulative.get(item.problem_id) || 0;
    const newTotal = current + item.post_count;
    cumulative.set(item.problem_id, newTotal);

    return {
      ...item,
      cumulative_count: newTotal,
    };
  });
}

export function exportToCSV(data: ProcessedPost[]): void {
  const headers = ["Problem", "Date", "Post Title", "Status", "Score", "Replies"];
  const rows = data.map((row) => [
    row.problem_title,
    row.date,
    row.title,
    row.status,
    row.score,
    row.reply_count,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `reddit-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Color palette and chart theme
export const PROBLEM_COLORS: Record<string, string> = {};
const FALLBACK_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#EC4899", "#14B8A6"];

export function getProblemColor(problemId: string, index: number): string {
  if (!PROBLEM_COLORS[problemId]) {
    PROBLEM_COLORS[problemId] = FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  }
  return PROBLEM_COLORS[problemId];
}

export const CHART_THEME = {
  background: "#FFFFFF",
  grid: "#E5E7EB",
  text: "#374151",
  axis: "#6B7280",
  tooltip: {
    background: "#1F2937",
    text: "#F9FAFB",
    border: "#374151",
  },
};