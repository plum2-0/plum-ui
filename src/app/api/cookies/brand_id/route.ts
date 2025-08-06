import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const brandId = cookieStore.get("brand_id");

    return NextResponse.json({
      value: brandId?.value || null,
    });
  } catch (error) {
    console.error("Error reading brand_id cookie:", error);
    return NextResponse.json(
      { error: "Failed to read cookie" },
      { status: 500 }
    );
  }
}
