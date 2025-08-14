import { NextRequest, NextResponse } from "next/server";
import { AgentDetailResponse, UpdateAgentRequest, RedditConvo, AgentMetrics } from "@/types/agent";

// Mock data - in production this would come from a database
const getMockAgent = (id: string) => {
  const agents = [
    {
      id: "agent-1",
      name: "Sarah - Support Hero",
      persona: "You are a friendly and knowledgeable customer support representative. You respond with empathy, provide clear solutions, and always maintain a professional yet warm tone. You ask clarifying questions when needed and follow up to ensure customer satisfaction.",
      goal: "Provide exceptional customer support by resolving issues quickly, educating users about product features, and creating positive brand experiences through every interaction.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      createdAt: new Date("2024-08-01T10:00:00Z"),
      updatedAt: new Date("2024-08-13T15:30:00Z"),
      isActive: true,
      templateId: "customer-support"
    },
    {
      id: "agent-2",
      name: "Alex - Community Champion",
      persona: "You are an enthusiastic community builder who loves connecting people and fostering discussions. You're casual but respectful, always encouraging participation and celebrating community wins. You ask thoughtful questions and share relevant insights.",
      goal: "Build and nurture an active, engaged community by facilitating meaningful discussions, recognizing valuable contributors, and creating an inclusive environment where everyone feels welcome to participate.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
      createdAt: new Date("2024-08-05T14:20:00Z"),
      updatedAt: new Date("2024-08-13T09:15:00Z"),
      isActive: true,
      templateId: "community-builder"
    },
    {
      id: "agent-3",
      name: "Dr. Code - Tech Wizard",
      persona: "You are a technical expert with deep knowledge in your field. You explain complex concepts clearly, provide detailed technical guidance, and back up your responses with evidence. You're patient with beginners while being thorough for advanced users.",
      goal: "Share technical expertise to help users solve complex problems, educate the community about best practices, and establish thought leadership in technical discussions.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=drcode",
      createdAt: new Date("2024-08-10T11:45:00Z"),
      updatedAt: new Date("2024-08-13T12:00:00Z"),
      isActive: true,
      templateId: "technical-expert"
    }
  ];

  return agents.find(agent => agent.id === id);
};

const getMockConversations = (agentId: string): RedditConvo[] => {
  if (agentId === "agent-1") {
    return [
      {
        parentPost: {
          id: "reddit-post-1",
          content: "I'm having trouble with PlumSprout's notification system. It seems like I'm not getting alerts for important mentions. Has anyone else experienced this?",
          author: "frustrated_user",
          authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=frustrated",
          createdAt: new Date("2024-08-13T14:30:00Z"),
          platform: "reddit",
          upvotes: 12,
          replyCount: 8,
          permalink: "https://reddit.com/r/marketing/comments/abc123"
        },
        parentReply: {
          id: "reddit-reply-1",
          content: "Hi there! I'm sorry to hear you're experiencing issues with notifications. This can be really frustrating when you're trying to stay on top of important mentions. Let me help you troubleshoot this:\n\n1. First, check your notification settings in the dashboard under Settings > Notifications\n2. Make sure your email/mobile notifications are enabled\n3. Verify that mentions aren't being filtered by your relevance threshold\n\nIf you're still having issues after checking these, please DM me or reach out to our support team - we'd be happy to take a closer look at your specific setup!",
          author: "PlumSprout_Sarah",
          authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
          createdAt: new Date("2024-08-13T14:45:00Z"),
          platform: "reddit",
          upvotes: 28,
          replyCount: 3,
          permalink: "https://reddit.com/r/marketing/comments/abc123/def456"
        },
        actions: [
          {
            userPost: {
              thing_id: "t1_kf8g9h2",
              content: "Thanks Sarah! I checked my settings and found the issue - my relevance threshold was set too high. Working perfectly now!",
              author: "frustrated_user"
            },
            agentReply: {
              content: "That's wonderful to hear! I'm so glad we could get that sorted out for you. The relevance threshold can be tricky to dial in at first. If you need any help fine-tuning it further or have any other questions, don't hesitate to reach out!"
            }
          },
          {
            userPost: {
              thing_id: "t1_kf8h3j4",
              content: "One more question - is there a way to get notifications for specific keywords only?",
              author: "frustrated_user"
            },
            agentReply: {
              content: "Absolutely! You can set up keyword filters in the Advanced Settings section. Just go to Settings > Notifications > Advanced Filters and add your specific keywords. You can even use boolean operators for more complex filtering. Would you like me to walk you through setting that up?"
            }
          }
        ]
      },
      {
        parentPost: {
          id: "reddit-post-2",
          content: "Looking for a social listening tool that actually works. Tired of missing important conversations about my brand. Any recommendations?",
          author: "marketingguru2024",
          authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marketing",
          createdAt: new Date("2024-08-13T16:15:00Z"),
          platform: "reddit",
          upvotes: 23,
          replyCount: 11,
          permalink: "https://reddit.com/r/marketing/comments/xyz789"
        },
        parentReply: {
          id: "reddit-reply-2",
          content: "Hey! I completely understand your frustration with missing brand conversations. PlumSprout specializes in exactly this - real-time social listening across multiple platforms. We help you catch every mention that matters, with smart filtering to reduce noise. Happy to share more details if you're interested!",
          author: "PlumSprout_Sarah",
          authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
          createdAt: new Date("2024-08-13T16:45:00Z"),
          platform: "reddit",
          upvotes: 15,
          replyCount: 2,
          permalink: "https://reddit.com/r/marketing/comments/xyz789/ghi789"
        },
        actions: []
      }
    ];
  }
  
  // Return empty array for other agents (for demo purposes)
  return [];
};

const getMockMetrics = (agentId: string): AgentMetrics => {
  return {
    agentId: agentId,
    totalConversations: 24,
    activeConversations: 8,
    responseRate: 0.75,
    engagementRate: 0.68,
    lastActive: new Date("2024-08-13T14:45:00Z"),
    redditMetrics: {
      totalKarma: 1247,
      totalUpvotes: 1389,
      totalComments: 156,
      totalConversations: 89,
      totalDownvotes: 142
    }
  };
};

// GET /api/agents/[id] - Get agent details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = getMockAgent(params.id);
    
    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    const response: AgentDetailResponse = {
      agent: agent,
      redditConversations: getMockConversations(params.id),
      metrics: getMockMetrics(params.id),
      totalConversations: 24
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching agent details:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent details" },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/[id] - Update agent
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateAgentRequest = await request.json();
    const agent = getMockAgent(params.id);
    
    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    // Update agent fields
    const updatedAgent = {
      ...agent,
      ...(body.name && { name: body.name }),
      ...(body.persona && { persona: body.persona }),
      ...(body.goal && { goal: body.goal }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      updatedAt: new Date()
    };

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error("Error updating agent:", error);
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id] - Delete agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = getMockAgent(params.id);
    
    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    // In production, delete from database
    // For mock, just return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting agent:", error);
    return NextResponse.json(
      { error: "Failed to delete agent" },
      { status: 500 }
    );
  }
}