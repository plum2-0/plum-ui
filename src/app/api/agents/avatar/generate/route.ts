import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { AvatarGenerator, AvatarStyle } from "@/lib/avatar";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      seed,
      style,
      count = 1,
      preset,
      options = {}
    } = body;

    // Generate single avatar with options
    if (count === 1) {
      let avatarUrl: string;
      
      if (preset && AvatarGenerator.presets[preset as keyof typeof AvatarGenerator.presets]) {
        // Use preset
        const presetFunc = AvatarGenerator.presets[preset as keyof typeof AvatarGenerator.presets];
        avatarUrl = presetFunc(seed || Math.random().toString(36).substring(7));
      } else if (!seed && !style) {
        // Generate random
        avatarUrl = AvatarGenerator.generateRandom();
      } else {
        // Generate with specific options
        avatarUrl = AvatarGenerator.generateUrl({
          seed,
          style: style as AvatarStyle,
          ...options
        });
      }
      
      return NextResponse.json({ 
        avatarUrl,
        seed: seed || new URL(avatarUrl).searchParams.get('seed')
      });
    }

    // Generate multiple variations
    const baseSeed = seed || Math.random().toString(36).substring(7);
    const variations = AvatarGenerator.generateVariations(
      baseSeed,
      count,
      style as AvatarStyle
    );

    return NextResponse.json({ 
      variations,
      baseSeed
    });

  } catch (error) {
    console.error("Avatar generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate avatar" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const seed = searchParams.get('seed');
    const style = searchParams.get('style') as AvatarStyle;
    const preset = searchParams.get('preset');

    let avatarUrl: string;
    
    if (preset && AvatarGenerator.presets[preset as keyof typeof AvatarGenerator.presets]) {
      const presetFunc = AvatarGenerator.presets[preset as keyof typeof AvatarGenerator.presets];
      avatarUrl = presetFunc(seed || Math.random().toString(36).substring(7));
    } else if (!seed && !style) {
      avatarUrl = AvatarGenerator.generateRandom();
    } else {
      avatarUrl = AvatarGenerator.generateUrl({
        seed,
        style,
      });
    }

    return NextResponse.json({ 
      avatarUrl,
      seed: seed || new URL(avatarUrl).searchParams.get('seed')
    });

  } catch (error) {
    console.error("Avatar generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate avatar" },
      { status: 500 }
    );
  }
}