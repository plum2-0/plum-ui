import { NextResponse } from "next/server";

// Mock data for AI initiatives
const mockInitiatives = [
  {
    id: "1",
    type: "post",
    title: "How I Overcame Chronic Migraines: A 5-Year Journey",
    target: "r/migraine",
    confidence: 85,
    timeToPost: "in 2 hours",
    status: "pending",
    content: "I've been dealing with chronic headaches for years and found these natural remedies helpful:\n\n1. Stay hydrated - drink at least 8 glasses of water daily\n2. Regular sleep schedule - same bedtime and wake time\n3. Magnesium supplements - 400mg daily helped reduce frequency\n4. Peppermint oil - apply to temples for relief\n5. Avoid trigger foods - keep a food diary\n\nWhat natural remedies have worked for you?",
    tags: ["health", "wellness", "natural-remedies"],
    expectedKarma: 150,
    priority: "high"
  },
  {
    id: "2",
    type: "comment",
    title: "Reply to: \"Best productivity apps for ADHD?\"",
    target: "r/productivity",
    confidence: 92,
    timeToPost: "in 30 minutes",
    status: "pending",
    content: "I've found that combining Forest app with Todoist works great for ADHD. Forest gamifies focus time, while Todoist breaks down tasks into manageable chunks. The key is using both together - Forest for focus sessions, Todoist for task management.",
    parentPost: "https://reddit.com/r/productivity/comments/abc123",
    tags: ["productivity", "adhd", "apps"],
    expectedKarma: 45,
    priority: "medium"
  },
  {
    id: "3",
    type: "post",
    title: "My Journey: From Burnout to Balance in Tech",
    target: "r/cscareerquestions",
    confidence: 78,
    timeToPost: "tomorrow at 9 AM",
    status: "scheduled",
    content: "After 5 years in tech, I hit complete burnout. Here's what I learned and how I recovered:\n\n**The Signs:**\n- Constant exhaustion\n- Lost passion for coding\n- Physical health declining\n\n**The Recovery:**\n- Set strict work boundaries\n- Started daily meditation\n- Picked up non-tech hobbies\n- Regular exercise routine\n\n**The Result:**\nI'm still in tech, but with better balance. Productivity actually increased when I stopped working 60+ hour weeks.\n\nHappy to answer questions about maintaining work-life balance in tech.",
    tags: ["career", "mental-health", "tech"],
    expectedKarma: 320,
    priority: "high"
  },
  {
    id: "4",
    type: "like",
    title: "Upvote high-quality posts in r/startups",
    target: "r/startups",
    confidence: 95,
    timeToPost: "ongoing",
    status: "active",
    content: "Automatically upvoting posts that match quality criteria in r/startups",
    postsToLike: 15,
    postsLiked: 7,
    tags: ["engagement", "community"],
    priority: "low"
  },
  {
    id: "5",
    type: "comment",
    title: "Share experience on remote work thread",
    target: "r/remotework",
    confidence: 88,
    timeToPost: "in 4 hours",
    status: "pending",
    content: "Been fully remote for 3 years now. Best tip: create a dedicated workspace, even if it's just a corner of a room. The psychological boundary between 'work' and 'home' is crucial for maintaining sanity.",
    parentPost: "https://reddit.com/r/remotework/comments/xyz789",
    tags: ["remote-work", "tips"],
    expectedKarma: 65,
    priority: "medium"
  },
  {
    id: "6",
    type: "post",
    title: "Weekly Discussion: Best VS Code Extensions 2024",
    target: "r/webdev",
    confidence: 71,
    timeToPost: "in 3 days",
    status: "draft",
    content: "Let's share our must-have VS Code extensions for 2024!\n\nMy top 5:\n1. GitHub Copilot - AI pair programming\n2. Prettier - Code formatting\n3. GitLens - Git supercharged\n4. Thunder Client - API testing\n5. Error Lens - Inline error highlighting\n\nWhat are your favorites?",
    tags: ["development", "tools", "vscode"],
    expectedKarma: 200,
    priority: "low"
  }
];

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return NextResponse.json({
    initiatives: mockInitiatives,
    total: mockInitiatives.length,
    timestamp: new Date().toISOString()
  });
}