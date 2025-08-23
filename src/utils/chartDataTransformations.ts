import { Prospect, RedditPost } from "@/types/brand";
import { format, parseISO, startOfDay } from "date-fns";

// Transform data for stacked bar chart by source keywords
export const transformStackedBarDataByKeywords = (prospect: Prospect) => {
  const posts = prospect.sourced_reddit_posts || [];
  
  // Group posts by source_keywords
  const keywordGroups: Record<string, RedditPost[]> = {};
  
  posts.forEach(post => {
    const keyword = post.source_keywords || "No Keyword";
    if (!keywordGroups[keyword]) {
      keywordGroups[keyword] = [];
    }
    keywordGroups[keyword].push(post);
  });
  
  // Transform to chart data
  return Object.entries(keywordGroups).map(([keyword, keywordPosts]) => {
    const statusCounts = keywordPosts.reduce((acc, post) => {
      const status = post.status || "PENDING";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalScore = keywordPosts.reduce((sum, post) => sum + (post.score || 0), 0);
    const avgScore = keywordPosts.length > 0 ? totalScore / keywordPosts.length : 0;
    
    return {
      name: keyword.length > 30 ? keyword.substring(0, 30) + "..." : keyword,
      fullName: keyword,
      ACTIONED: statusCounts.ACTIONED || 0,
      PENDING: statusCounts.PENDING || 0,
      IGNORE: statusCounts.IGNORE || 0,
      SUGGESTED_REPLY: statusCounts.SUGGESTED_REPLY || 0,
      total: keywordPosts.length,
      avgScore: Math.round(avgScore),
    };
  }).sort((a, b) => b.total - a.total); // Sort by total posts
};

// Transform data for stacked bar chart (original - by prospect)
export const transformStackedBarData = (prospects: Prospect[]) => {
  return prospects.map((prospect) => {
    const posts = prospect.sourced_reddit_posts || [];
    
    // Count posts by status
    const statusCounts = posts.reduce((acc, post) => {
      const status = post.status || "PENDING";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate engagement metrics
    const totalScore = posts.reduce((sum, post) => sum + (post.score || 0), 0);
    const avgScore = posts.length > 0 ? totalScore / posts.length : 0;

    return {
      name: prospect.problem_to_solve.substring(0, 40) + "...",
      fullName: prospect.problem_to_solve,
      ACTIONED: statusCounts.ACTIONED || 0,
      PENDING: statusCounts.PENDING || 0,
      IGNORE: statusCounts.IGNORE || 0,
      SUGGESTED_REPLY: statusCounts.SUGGESTED_REPLY || 0,
      total: posts.length,
      avgScore: Math.round(avgScore),
    };
  });
};

// Transform data for posts over time (post count)
export const transformPostsOverTimeData = (prospects: Prospect[]) => {
  // Collect all unique dates
  const dateMap = new Map<string, any>();
  
  prospects.forEach((prospect, prospectIndex) => {
    const posts = prospect.sourced_reddit_posts || [];
    
    posts.forEach((post) => {
      // Convert Unix timestamp to date string
      const date = format(new Date(post.created_utc * 1000), "yyyy-MM-dd");
      
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          timestamp: post.created_utc,
        });
      }
      
      const dataPoint = dateMap.get(date);
      const key = `prospect${prospectIndex}`;
      
      // Initialize prospect data if not exists
      if (!dataPoint[key]) {
        dataPoint[key] = {
          posts: 0,
        };
      }
      
      // Count posts
      dataPoint[key].posts += 1;
    });
  });
  
  // Convert to array and sort by date
  const sortedData = Array.from(dateMap.values())
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((item) => {
      const result: any = {
        date: format(new Date(item.timestamp * 1000), "MMM dd"),
        fullDate: item.date,
      };
      
      // Add prospect data - for posts over time, we'll use "Posts" as the line label
      prospects.forEach((prospect, index) => {
        const key = `prospect${index}`;
        if (item[key]) {
          result["Posts"] = item[key].posts;
        }
      });
      
      return result;
    });
  
  return sortedData;
};

// Transform data for multi-line chart (time series - original with scores)
export const transformTimeSeriesData = (prospects: Prospect[]) => {
  // Collect all unique dates
  const dateMap = new Map<string, any>();
  
  prospects.forEach((prospect, prospectIndex) => {
    const posts = prospect.sourced_reddit_posts || [];
    
    posts.forEach((post) => {
      // Convert Unix timestamp to date string
      const date = format(new Date(post.created_utc * 1000), "yyyy-MM-dd");
      
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          timestamp: post.created_utc,
        });
      }
      
      const dataPoint = dateMap.get(date);
      const key = `prospect${prospectIndex}`;
      
      // Initialize prospect data if not exists
      if (!dataPoint[key]) {
        dataPoint[key] = {
          posts: 0,
          score: 0,
          upvotes: 0,
          replies: 0,
        };
      }
      
      // Aggregate metrics
      dataPoint[key].posts += 1;
      dataPoint[key].score += post.score || 0;
      dataPoint[key].upvotes += post.upvotes || 0;
      dataPoint[key].replies += post.reply_count || 0;
    });
  });
  
  // Convert to array and sort by date
  const sortedData = Array.from(dateMap.values())
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((item) => {
      const result: any = {
        date: format(new Date(item.timestamp * 1000), "MMM dd"),
        fullDate: item.date,
      };
      
      // Add prospect data
      prospects.forEach((prospect, index) => {
        const key = `prospect${index}`;
        if (item[key]) {
          result[`${prospect.problem_to_solve.substring(0, 20)}...`] = item[key].score;
        }
      });
      
      return result;
    });
  
  return sortedData;
};

// Calculate engagement metrics for each prospect
export const calculateEngagementMetrics = (prospects: Prospect[]) => {
  return prospects.map((prospect) => {
    const posts = prospect.sourced_reddit_posts || [];
    
    const totalScore = posts.reduce((sum, post) => sum + (post.score || 0), 0);
    const totalUpvotes = posts.reduce((sum, post) => sum + (post.upvotes || 0), 0);
    const totalReplies = posts.reduce((sum, post) => sum + (post.reply_count || 0), 0);
    
    return {
      name: prospect.problem_to_solve,
      totalPosts: posts.length,
      totalScore,
      totalUpvotes,
      totalReplies,
      avgScore: posts.length > 0 ? Math.round(totalScore / posts.length) : 0,
      avgReplies: posts.length > 0 ? Math.round(totalReplies / posts.length) : 0,
      engagementRate: posts.length > 0 
        ? Math.round(((totalUpvotes + totalReplies) / posts.length) * 100) / 100
        : 0,
    };
  });
};

// Get color palette for charts
export const getChartColors = () => ({
  gradients: [
    { start: "#8B5CF6", end: "#3B82F6" }, // Purple to Blue
    { start: "#EC4899", end: "#8B5CF6" }, // Pink to Purple
    { start: "#3B82F6", end: "#06B6D4" }, // Blue to Cyan
    { start: "#10B981", end: "#3B82F6" }, // Green to Blue
    { start: "#F59E0B", end: "#EF4444" }, // Amber to Red
  ],
  statusColors: {
    ACTIONED: "#10B981",      // Emerald
    PENDING: "#F59E0B",        // Amber
    IGNORE: "#6B7280",         // Gray
    SUGGESTED_REPLY: "#8B5CF6", // Purple
  },
  lineColors: [
    "#8B5CF6", // Purple
    "#3B82F6", // Blue
    "#EC4899", // Pink
    "#10B981", // Emerald
    "#F59E0B", // Amber
  ],
});