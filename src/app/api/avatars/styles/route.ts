import { NextRequest, NextResponse } from "next/server";
import { AvatarGenerator } from "@/lib/avatar";

export async function GET(request: NextRequest) {
  try {
    const styles = AvatarGenerator.getAvailableStyles();
    
    return NextResponse.json({ 
      styles,
      count: styles.length
    });

  } catch (error) {
    console.error("Avatar styles error:", error);
    return NextResponse.json(
      { error: "Failed to get avatar styles" },
      { status: 500 }
    );
  }
}