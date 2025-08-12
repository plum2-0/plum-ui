import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const brandId = cookieStore.get("brand_id")?.value;

    if (!brandId) {
      return NextResponse.json({ error: "No brand selected" }, { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const resp = await fetch(
      `${backendUrl}/api/engagement/${brandId}/generate-comment-suggestions`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "plum-ui",
        },
      }
    );

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: text || "Failed to fetch comment suggestions" },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    // Ensure we always return an array
    const suggestions = Array.isArray(data) ? data : [];
    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching comment suggestions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 