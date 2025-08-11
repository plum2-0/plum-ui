import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

function mapBackendToInitiative(raw: any) {
  const titleFallback =
    raw?.title ||
    (raw?.action_type === "post"
      ? `Create post in r/${raw?.target_subreddit ?? ""}`
      : raw?.action_type === "comment"
      ? `Comment in r/${raw?.target_subreddit ?? ""}`
      : "Like posts");

  return {
    id: raw?.action_id,
    type: raw?.action_type,
    title: titleFallback,
    content: raw?.content ?? "",
    subreddit: raw?.target_subreddit ?? "",
    targetPostUrl: raw?.post_id
      ? `https://reddit.com/${raw.post_id}`
      : undefined,
    confidence: Math.round((raw?.confidence ?? 0.75) * 100) || 75,
    status: raw?.status ?? "pending",
    scheduledFor: raw?.schedule_time ?? "",
    expectedKarma: 100,
    bestPostTime: "3:00 PM EST",
    trendingTopics: [],
    aiInsights: {
      engagementPrediction: "Moderate",
      sentimentScore: 0.7,
      readabilityScore: 8.0,
      similarPostsPerformance: {
        averageKarma: 100,
        averageComments: 25,
        topPerformingTime: "2:00 PM - 4:00 PM",
      },
    },
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const brandId = cookieStore.get("brand_id")?.value;

    if (!brandId) {
      return NextResponse.json(
        { success: false, error: "No brand selected" },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const resp = await fetch(
      `${backendUrl}/api/engagement/${brandId}/actions/${id}`,
      { headers: { "Content-Type": "application/json" } }
    );

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Backend error fetching action:", resp.status, text);
      return NextResponse.json(
        { success: false, error: "Failed to fetch initiative" },
        { status: 500 }
      );
    }

    const raw = await resp.json();
    return NextResponse.json({
      success: true,
      data: mapBackendToInitiative(raw),
    });
  } catch (error) {
    console.error("Error fetching initiative:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch initiative" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const brandId = cookieStore.get("brand_id")?.value;
    if (!brandId) {
      return NextResponse.json(
        { success: false, error: "No brand selected" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const statusMap: Record<string, string> = {
      draft: "pending",
      scheduled: "scheduled",
      posted: "completed",
    };

    const updatePayload: any = {};
    if (typeof body.title === "string") updatePayload.title = body.title;
    if (typeof body.content === "string") updatePayload.content = body.content;
    if (typeof body.subreddit === "string")
      updatePayload.target_subreddit = body.subreddit;
    if (typeof body.scheduledFor === "string" && body.scheduledFor)
      updatePayload.schedule_time = body.scheduledFor;
    if (typeof body.status === "string" && statusMap[body.status])
      updatePayload.status = statusMap[body.status];

    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const resp = await fetch(
      `${backendUrl}/api/engagement/${brandId}/actions/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      }
    );

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Backend error updating action:", resp.status, text);
      return NextResponse.json(
        { success: false, error: "Failed to update initiative" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { ...body, id: id, updatedAt: new Date().toISOString() },
      message: "Initiative updated successfully",
    });
  } catch (error) {
    console.error("Error updating initiative:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update initiative" },
      { status: 500 }
    );
  }
}
