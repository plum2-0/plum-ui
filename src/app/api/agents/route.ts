import { NextRequest, NextResponse } from "next/server";
import { AgentListResponse, Agent, CreateAgentRequest } from "@/types/agent";

// Mock data store (in production, this would be a database)
let mockAgents: Agent[] = [
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

// GET /api/agents - List all agents
export async function GET(request: NextRequest) {
  try {
    const response: AgentListResponse = {
      agents: mockAgents,
      totalCount: mockAgents.length
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create new agent
export async function POST(request: NextRequest) {
  try {
    const body: CreateAgentRequest = await request.json();
    
    // Validate request
    if (!body.name || !body.persona || !body.goal) {
      return NextResponse.json(
        { error: "Name, persona, and goal are required" },
        { status: 400 }
      );
    }

    // Create new agent
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: body.name,
      persona: body.persona,
      goal: body.goal,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(body.name)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      templateId: body.templateId
    };

    // Add to mock store
    mockAgents.push(newAgent);

    return NextResponse.json(newAgent, { status: 201 });
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}