import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Get brand_id from cookies
    const cookieStore = cookies();
    const brandId = cookieStore.get("brand_id")?.value;

    if (!brandId) {
      // Return mock data if no brand_id is set
      return NextResponse.json({
        initiatives: [],
        message:
          "No brand selected. Please select a brand to view engagement suggestions.",
      });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const includeDismissed = searchParams.get("include_dismissed") === "true";

    // Call backend API
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(
      `${backendUrl}/api/engagement/${brandId}/actions?include_dismissed=${includeDismissed}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      // If backend is not available or returns error, return empty array
      console.error(
        `Backend API error: ${response.status} ${response.statusText}`
      );
      return NextResponse.json({
        initiatives: [],
        error: "Failed to fetch initiatives from backend",
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching initiatives:", error);
    // Return empty array on error
    return NextResponse.json({
      initiatives: [],
      error: "Failed to fetch initiatives",
    });
  }
}
