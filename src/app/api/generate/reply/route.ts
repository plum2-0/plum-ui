import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { post_content: string; prompt: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body?.post_content || !body?.prompt) {
      return NextResponse.json(
        { error: "post_content and prompt are required" },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8000";
    const resp = await fetch(`${backendUrl}/api/brand/generate/reply`, {
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
  } catch (error) {
    console.error("Error generating reply:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
