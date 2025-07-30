import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

interface SubredditSuggestion {
  name: string;
  display_name: string;
  subscribers: number;
  icon_img?: string;
  public_description?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameter
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Get Reddit access token from environment or use app-only auth
    const clientId = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Reddit credentials not configured");
      return NextResponse.json(
        { error: "Reddit API not configured" },
        { status: 500 }
      );
    }

    // Get app-only access token
    const tokenResponse = await fetch(
      "https://www.reddit.com/api/v1/access_token",
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials&scope=read",
      }
    );

    if (!tokenResponse.ok) {
      console.error("Failed to get Reddit access token:", await tokenResponse.text());
      return NextResponse.json(
        { error: "Failed to authenticate with Reddit" },
        { status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Search subreddits using Reddit API
    const searchResponse = await fetch(
      `https://oauth.reddit.com/api/subreddit_autocomplete_v2?query=${encodeURIComponent(query)}&include_over_18=false&include_profiles=false&limit=10`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "User-Agent": "Plum/1.0",
        },
      }
    );

    if (!searchResponse.ok) {
      console.error("Reddit search failed:", await searchResponse.text());
      return NextResponse.json(
        { error: "Failed to search subreddits" },
        { status: 500 }
      );
    }

    const searchData = await searchResponse.json();
    
    // Format the response
    const suggestions: SubredditSuggestion[] = searchData.data?.children?.map((item: { data: {
      display_name: string;
      subscribers?: number;
      icon_img?: string;
      community_icon?: string;
      public_description?: string;
    }}) => ({
      name: item.data.display_name,
      display_name: `r/${item.data.display_name}`,
      subscribers: item.data.subscribers || 0,
      icon_img: item.data.icon_img || item.data.community_icon,
      public_description: item.data.public_description,
    })) || [];

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error searching subreddits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}