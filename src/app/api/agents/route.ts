import { NextRequest, NextResponse } from "next/server";
import { AgentListResponse, Agent, CreateAgentRequest } from "@/types/agent";
import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { getBrandIdFromRequest } from "@/lib/cookies";

// GET /api/agents - List all agents for current brand (Firestore-backed)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brandId = getBrandIdFromRequest(request);
    if (!brandId) {
      return NextResponse.json(
        { error: "Brand not selected" },
        { status: 400 }
      );
    }

    const firestore = adminDb();
    if (!firestore) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const querySnapshot = await firestore
      .collection("agents")
      .where("brand_id", "==", brandId)
      .get();

    const agents: Agent[] = querySnapshot.docs.map((doc) => {
      const data = doc.data() as any;
      const createdAtIso: string | undefined = data.created_at;
      const updatedAtIso: string | undefined = data.updated_at;
      return {
        id: data.id ?? doc.id,
        name: data.name,
        persona: data.persona,
        goal: data.goal,
        avatar: data.avatar_url,
        createdAt: createdAtIso ? new Date(createdAtIso) : new Date(),
        updatedAt: updatedAtIso ? new Date(updatedAtIso) : new Date(),
        isActive: (data.status ?? "active") === "active",
        templateId: data.template_id,
      } as Agent;
    });

    const response: AgentListResponse = {
      agents,
      totalCount: agents.length,
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

// POST /api/agents - Create new agent (Firestore-backed)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brandId = getBrandIdFromRequest(request);
    if (!brandId) {
      return NextResponse.json(
        { error: "Brand not selected" },
        { status: 400 }
      );
    }

    const body: CreateAgentRequest = await request.json();

    // Validate request
    if (!body.name || !body.persona || !body.goal) {
      return NextResponse.json(
        { error: "Name, persona, and goal are required" },
        { status: 400 }
      );
    }

    const firestore = adminDb();
    if (!firestore) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    // Generate ID and build Firestore document (snake_case to match backend models)
    const agentId =
      (globalThis as any).crypto?.randomUUID?.() || `${Date.now()}`;
    const nowIso = new Date().toISOString();
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      body.name
    )}`;

    const docData = {
      id: agentId,
      brand_id: brandId,
      name: body.name,
      persona: body.persona,
      goal: body.goal,
      avatar_url: avatarUrl,
      template_id: body.templateId ?? null,
      status: "active",
      created_at: nowIso,
      updated_at: nowIso,
    } as const;

    await firestore.collection("agents").doc(agentId).set(docData);

    const createdAgent: Agent = {
      id: agentId,
      name: body.name,
      persona: body.persona,
      goal: body.goal,
      avatar: avatarUrl,
      createdAt: new Date(nowIso),
      updatedAt: new Date(nowIso),
      isActive: true,
      templateId: body.templateId,
    };

    return NextResponse.json(createdAgent, { status: 201 });
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
