import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Proxies brand post actions to the backend API
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // Support both legacy Agents flow and new Prospect flow
    const isProspectFlow =
      body &&
      typeof body === "object" &&
      body.reddit_post &&
      body.brand_id &&
      body.prospect_id &&
      body.user_content_action;

    if (isProspectFlow) {
      // Minimal validation for prospect flow
      const requiredProspectFields = [
        "brand_id",
        "prospect_id",
        "user_content_action",
        "reddit_post",
      ] as const;
      for (const field of requiredProspectFields) {
        if (!(field in body)) {
          return NextResponse.json(
            { error: `Missing field: ${field}` },
            { status: 400 }
          );
        }
      }

      const resp = await fetch(`${backendUrl}/api/brand/post/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const text = await resp.text();
        return NextResponse.json(
          { error: text || "Backend error" },
          { status: resp.status }
        );
      }

      const data = await resp.json();
      return NextResponse.json(data, { status: 200 });
    } else {
      // Legacy agents flow validation
      const requiredFields = [
        "brand_id",
        "problem_id",
        "subreddit_post_id",
        "post_id",
        "user_content_action",
      ];

      for (const field of requiredFields) {
        if (!body?.[field] || typeof body[field] !== "string") {
          return NextResponse.json(
            { error: `Missing or invalid field: ${field}` },
            { status: 400 }
          );
        }
      }

      const resp = await fetch(`${backendUrl}/api/agents/post/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const text = await resp.text();
        return NextResponse.json(
          { error: text || "Backend error" },
          { status: resp.status }
        );
      }

      const data = await resp.json();
      return NextResponse.json(data, { status: 200 });
    }
  } catch (error) {
    console.error("Error forwarding brand post action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
