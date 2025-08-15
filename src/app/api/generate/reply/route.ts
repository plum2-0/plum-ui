import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: {
      post_title: string;
      post_subreddit: string;
      post_content: string;
      prompt: string;
      brand_id?: string;
      problem_id?: string;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const brandIdFromCookie = cookieStore.get("brand_id")?.value;

    const finalPayload = {
      post_title: body?.post_title,
      post_subreddit: body?.post_subreddit,
      post_content: body?.post_content,
      prompt: body?.prompt,
      brand_id: body?.brand_id || brandIdFromCookie,
      problem_id: body?.problem_id,
    } as const;

    if (
      !finalPayload.post_title ||
      !finalPayload.post_subreddit ||
      !finalPayload.post_content ||
      !finalPayload.prompt ||
      !finalPayload.brand_id ||
      !finalPayload.problem_id
    ) {
      return NextResponse.json(
        {
          error:
            "post_title, post_subreddit, post_content, prompt, brand_id, and problem_id are required",
        },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const resp = await fetch(`${backendUrl}/api/brand/generate/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalPayload),
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
  } catch (error) {
    console.error("Error generating reply:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
