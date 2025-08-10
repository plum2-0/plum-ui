import { NextRequest, NextResponse } from "next/server";

// Mock data for single initiative
const generateMockInitiative = (id: string) => {
  const initiatives = [
    {
      id: "1",
      type: "post",
      title: "How I Overcame Chronic Migraines: A 5-Year Journey",
      content: `After suffering from debilitating migraines for years, I finally found a combination of treatments that worked for me. Here's what I learned:

## The Beginning
It started when I was 25. At first, I thought they were just bad headaches from stress at work. But they kept getting worse...

## What Didn't Work
- Over-the-counter painkillers (temporary relief at best)
- Cutting out coffee completely (actually made it worse)
- Generic meditation apps

## The Breakthrough
My neurologist suggested keeping a detailed trigger diary. After 3 months, we identified patterns:
1. Weather pressure changes
2. Certain foods (aged cheese, processed meats)
3. Irregular sleep schedule

## My Current Management Plan
- Preventive medication (prescribed by neurologist)
- Consistent sleep schedule (10pm-6am)
- Modified diet avoiding triggers
- Specific yoga routine for neck tension

## Results
From 15+ migraine days per month to just 2-3. Life changing.

Remember: What works for me might not work for you. Always consult with a healthcare professional!`,
      subreddit: "migraine",
      confidence: 85,
      status: "draft",
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      expectedKarma: 150,
      bestPostTime: "5:00 PM EST",
      trendingTopics: ["chronic pain", "migraine relief", "health journey"],
      aiInsights: {
        engagementPrediction: "High",
        sentimentScore: 0.82,
        readabilityScore: 8.5,
        similarPostsPerformance: {
          averageKarma: 142,
          averageComments: 34,
          topPerformingTime: "5:00 PM - 7:00 PM"
        }
      }
    },
    {
      id: "2",
      type: "post",
      title: "Just discovered this game-changing ergonomic keyboard setup",
      content: `I've been dealing with RSI for months, and this setup has been a game-changer. Thought I'd share with fellow developers who might be struggling.

## The Setup
- Split mechanical keyboard (Moonlander)
- Vertical mouse
- Monitor arm for proper height
- Wrist rests

## Why It Works
The split design lets you keep your shoulders relaxed and arms at a natural angle. No more hunching!

## Tips for Transitioning
1. Start with just 1 hour per day
2. Keep your old setup nearby for urgent work
3. Use a typing trainer to rebuild muscle memory

Happy to answer any questions!`,
      subreddit: "programming",
      confidence: 78,
      status: "scheduled",
      scheduledFor: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      expectedKarma: 89,
      bestPostTime: "10:00 AM EST",
      trendingTopics: ["ergonomics", "RSI prevention", "developer health"],
      aiInsights: {
        engagementPrediction: "Moderate",
        sentimentScore: 0.75,
        readabilityScore: 7.8,
        similarPostsPerformance: {
          averageKarma: 95,
          averageComments: 22,
          topPerformingTime: "9:00 AM - 11:00 AM"
        }
      }
    },
    {
      id: "3",
      type: "comment",
      title: "Reply to: Anyone else dealing with impostor syndrome?",
      content: `I've been in tech for 10 years and still feel this way sometimes. What helped me:

1. Keep a "wins journal" - document your achievements, no matter how small
2. Remember that everyone Googles things, even senior devs
3. Focus on growth, not perfection

You're not alone in feeling this way. The fact that you care about doing well shows you're on the right track!`,
      subreddit: "learnprogramming",
      targetPostUrl: "https://reddit.com/r/learnprogramming/comments/abc123",
      confidence: 92,
      status: "draft",
      scheduledFor: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      expectedKarma: 45,
      bestPostTime: "2:00 PM EST",
      trendingTopics: ["impostor syndrome", "career advice", "mental health"],
      aiInsights: {
        engagementPrediction: "High",
        sentimentScore: 0.88,
        readabilityScore: 9.2,
        similarPostsPerformance: {
          averageKarma: 52,
          averageComments: 8,
          topPerformingTime: "1:00 PM - 3:00 PM"
        }
      }
    }
  ];

  const initiative = initiatives.find(i => i.id === id);
  if (initiative) {
    return initiative;
  }

  // Generate a default one if not found
  return {
    id,
    type: "post",
    title: "Sample Post Title",
    content: "This is sample content for the initiative. You can edit this content in the editor.",
    subreddit: "test",
    confidence: 75,
    status: "draft",
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    expectedKarma: 100,
    bestPostTime: "3:00 PM EST",
    trendingTopics: ["sample", "test"],
    aiInsights: {
      engagementPrediction: "Moderate",
      sentimentScore: 0.7,
      readabilityScore: 8.0,
      similarPostsPerformance: {
        averageKarma: 100,
        averageComments: 25,
        topPerformingTime: "2:00 PM - 4:00 PM"
      }
    }
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const initiative = generateMockInitiative(params.id);
    
    return NextResponse.json({ success: true, data: initiative });
  } catch (error) {
    console.error("Error fetching initiative:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch initiative" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // In a real app, this would update the database
    // For now, just return the updated data
    const updatedInitiative = {
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({ 
      success: true, 
      data: updatedInitiative,
      message: "Initiative updated successfully" 
    });
  } catch (error) {
    console.error("Error updating initiative:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update initiative" },
      { status: 500 }
    );
  }
}