import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Endpoint to generate new engagement actions
export async function GET(request: NextRequest) {
  try {
    // Get brand_id from cookies
    const cookieStore = await cookies();
    const brandId = cookieStore.get("brand_id")?.value;

    if (!brandId) {
      return NextResponse.json({ error: "No brand selected" }, { status: 400 });
    }

    // Call backend API to generate actions
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(
      `${backendUrl}/api/engagement/${brandId}/generate-actions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || "Failed to generate actions" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating initiatives:", error);
    return NextResponse.json(
      { error: "Failed to generate initiatives" },
      { status: 500 }
    );
  }
}

// Endpoint to update action status
export async function PUT(request: NextRequest) {
  try {
    // Get brand_id from cookies
    const cookieStore = await cookies();
    const brandId = cookieStore.get("brand_id")?.value;

    if (!brandId) {
      return NextResponse.json({ error: "No brand selected" }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { actionId, status, errorMsg } = body;

    if (!actionId || !status) {
      return NextResponse.json(
        { error: "Missing actionId or status" },
        { status: 400 }
      );
    }

    // Call backend API to update status
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const url = new URL(
      `${backendUrl}/api/engagement/${brandId}/actions/${actionId}/status`
    );
    url.searchParams.append("status", status);
    if (errorMsg) {
      url.searchParams.append("error_msg", errorMsg);
    }

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || "Failed to update action status" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating action status:", error);
    return NextResponse.json(
      { error: "Failed to update action status" },
      { status: 500 }
    );
  }
}
