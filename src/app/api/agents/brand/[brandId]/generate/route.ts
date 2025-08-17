import { NextRequest, NextResponse } from "next/server";

// POST /api/agents/brand/[brandId]/generate - Generate AI agent via backend API
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;
    
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    const response = await fetch(`${backendUrl}/api/agents/brand/${brandId}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to generate agent" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating agent:", error);
    return NextResponse.json(
      { error: "Failed to generate agent" },
      { status: 500 }
    );
  }
}