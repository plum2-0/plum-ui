import { NextRequest, NextResponse } from "next/server";
import { verifyRedditAccount } from "@/lib/middleware/verifyRedditAccount";

export async function GET(request: NextRequest) {
  const result = await verifyRedditAccount(request);

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        message: result.message,
        needsOnboarding: result.needsOnboarding || false,
        needsRedditAuth: result.needsRedditAuth || false,
      },
      { status: result.status }
    );
  }

  return NextResponse.json({
    ok: true,
    brandId: result.brandId,
    reddit: result.reddit || null,
  });
}
