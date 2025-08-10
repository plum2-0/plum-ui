import { NextResponse } from "next/server";

// Mock timeline data
const mockTimeline = {
  today: {
    date: "August 10",
    events: [
      {
        id: "evt-1",
        time: "5:00 PM",
        type: "post",
        title: "Post to r/migraine",
        status: "scheduled",
        subreddit: "r/migraine",
        confidence: 85
      },
      {
        id: "evt-2",
        time: "6:30 PM",
        type: "like",
        title: "Upvote in r/startups",
        status: "scheduled",
        subreddit: "r/startups",
        count: 5
      },
      {
        id: "evt-3",
        time: "8:00 PM",
        type: "comment",
        title: "Reply in r/productivity",
        status: "scheduled",
        subreddit: "r/productivity",
        confidence: 92
      }
    ]
  },
  tomorrow: {
    date: "August 11",
    events: [
      {
        id: "evt-4",
        time: "8:00 AM",
        type: "post",
        title: "Weekly thread in r/webdev",
        status: "scheduled",
        subreddit: "r/webdev",
        confidence: 71
      },
      {
        id: "evt-5",
        time: "10:00 AM",
        type: "comment",
        title: "Multiple replies",
        status: "scheduled",
        subreddit: "various",
        count: 3
      },
      {
        id: "evt-6",
        time: "2:00 PM",
        type: "post",
        title: "Tech career advice",
        status: "scheduled",
        subreddit: "r/cscareerquestions",
        confidence: 78
      }
    ]
  },
  upcoming: {
    date: "August 12+",
    events: [
      {
        id: "evt-7",
        time: "Aug 12, 9:00 AM",
        type: "post",
        title: "Content series part 1",
        status: "planned",
        subreddit: "r/learnprogramming",
        confidence: 82
      },
      {
        id: "evt-8",
        time: "Aug 13, 3:00 PM",
        type: "comment",
        title: "Expert answers",
        status: "planned",
        subreddit: "r/askscience",
        count: 4
      },
      {
        id: "evt-9",
        time: "Aug 14, 11:00 AM",
        type: "post",
        title: "Community discussion",
        status: "planned",
        subreddit: "r/technology",
        confidence: 76
      }
    ]
  },
  completed: {
    date: "Recently Completed",
    events: [
      {
        id: "evt-10",
        time: "Today, 2:00 PM",
        type: "post",
        title: "Tutorial posted",
        status: "completed",
        subreddit: "r/javascript",
        karma: 145
      },
      {
        id: "evt-11",
        time: "Today, 10:00 AM",
        type: "comment",
        title: "Helpful reply",
        status: "completed",
        subreddit: "r/reactjs",
        karma: 32
      },
      {
        id: "evt-12",
        time: "Yesterday, 6:00 PM",
        type: "like",
        title: "Community engagement",
        status: "completed",
        subreddit: "multiple",
        count: 25
      }
    ]
  }
};

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 250));
  
  return NextResponse.json({
    timeline: mockTimeline,
    totalScheduled: 9,
    totalCompleted: 3,
    timestamp: new Date().toISOString()
  });
}