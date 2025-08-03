import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const projectId = cookieStore.get("project_id");
    
    return NextResponse.json({
      value: projectId?.value || null
    });
  } catch (error) {
    console.error("Error reading cookie:", error);
    return NextResponse.json(
      { error: "Failed to read cookie" },
      { status: 500 }
    );
  }
}