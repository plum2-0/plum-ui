"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SubredditAutocomplete } from "@/components/SubredditAutocomplete";
import { Calendar, Clock, TrendingUp, BarChart, MessageSquare, Save, Send, X } from "lucide-react";

interface Initiative {
  id: string;
  type: "post" | "comment";
  title: string;
  content: string;
  subreddit: string;
  targetPostUrl?: string;
  confidence: number;
  status: string;
  scheduledFor: string;
  expectedKarma: number;
  bestPostTime: string;
  trendingTopics: string[];
  aiInsights: {
    engagementPrediction: string;
    sentimentScore: number;
    readabilityScore: number;
    similarPostsPerformance: {
      averageKarma: number;
      averageComments: number;
      topPerformingTime: string;
    };
  };
}

interface InitiativeDetailProps {
  initiativeId: string;
}

export default function InitiativeDetail({ initiativeId }: InitiativeDetailProps) {
  const router = useRouter();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    subreddit: "",
    scheduledFor: "",
  });

  useEffect(() => {
    fetchInitiative();
  }, [initiativeId]);

  const fetchInitiative = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/initiatives/${initiativeId}`);
      const data = await response.json();
      
      if (data.success) {
        setInitiative(data.data);
        setFormData({
          title: data.data.title,
          content: data.data.content,
          subreddit: data.data.subreddit,
          scheduledFor: data.data.scheduledFor,
        });
      }
    } catch (error) {
      console.error("Error fetching initiative:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (action: "draft" | "schedule" | "post") => {
    try {
      setSaving(true);
      const response = await fetch(`/api/initiatives/${initiativeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: action === "draft" ? "draft" : action === "schedule" ? "scheduled" : "posted",
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Show success message (in real app, use toast)
        console.log(`Initiative ${action}ed successfully`);
        
        if (action === "post") {
          // Redirect back to dashboard after posting
          router.push("/agent-dashboard");
        }
      }
    } catch (error) {
      console.error("Error saving initiative:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">Initiative not found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Content Editor Panel */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          Content Editor
        </h2>

        <div className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Title
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Enter post title..."
                maxLength={300}
              />
              <span className="absolute right-3 top-3 text-xs text-white/40">
                {formData.title.length}/300
              </span>
            </div>
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              placeholder="Write your post content..."
              rows={12}
            />
          </div>

          {/* Subreddit Selector */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Subreddit
            </label>
            <SubredditAutocomplete
              value={formData.subreddit}
              onChange={(value) => setFormData({ ...formData, subreddit: value })}
              placeholder="Search for a subreddit..."
            />
          </div>

          {/* Schedule Picker */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Schedule
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledFor?.slice(0, 16)}
              onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Preview & Insights Panel */}
      <div className="space-y-6">
        {/* Reddit Preview */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Reddit Preview
          </h2>
          
          <div className="bg-[#1A1A1B] rounded-lg p-4 border border-[#343536]">
            {/* Reddit Post Preview */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-1">
                <button className="text-[#818384] hover:text-[#FF4500] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 5l-7 7h4v6h6v-6h4l-7-7z" />
                  </svg>
                </button>
                <span className="text-sm font-bold text-[#D7DADC]">{initiative.expectedKarma}</span>
                <button className="text-[#818384] hover:text-[#7193FF] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 15l7-7h-4V2H7v6H3l7 7z" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-[#818384] mb-2">
                  <span className="text-[#D7DADC] font-medium">r/{formData.subreddit || "subreddit"}</span>
                  <span>•</span>
                  <span>Posted by u/YourUsername</span>
                  <span>•</span>
                  <span>just now</span>
                </div>
                
                <h3 className="text-lg font-medium text-[#D7DADC] mb-2">
                  {formData.title || "Post Title"}
                </h3>
                
                <div className="text-sm text-[#D7DADC] whitespace-pre-wrap">
                  {formData.content || "Post content will appear here..."}
                </div>
                
                <div className="flex items-center gap-4 mt-4 text-xs text-[#818384]">
                  <button className="flex items-center gap-1 hover:bg-[#272729] px-2 py-1 rounded">
                    <MessageSquare className="w-4 h-4" />
                    <span>{initiative.aiInsights.similarPostsPerformance.averageComments} Comments</span>
                  </button>
                  <button className="flex items-center gap-1 hover:bg-[#272729] px-2 py-1 rounded">
                    Share
                  </button>
                  <button className="flex items-center gap-1 hover:bg-[#272729] px-2 py-1 rounded">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            AI Insights
          </h2>
          
          <div className="space-y-4">
            {/* Confidence Score */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white/80">AI Confidence</span>
                <span className="text-sm font-bold text-purple-400">{initiative.confidence}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${initiative.confidence}%` }}
                />
              </div>
            </div>

            {/* Expected Karma */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white/80">Expected Karma</span>
              </div>
              <span className="text-lg font-bold text-green-400">~{initiative.expectedKarma}</span>
            </div>

            {/* Best Post Time */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-white/80">Best Time</span>
              </div>
              <span className="text-sm font-medium text-orange-400">{initiative.bestPostTime}</span>
            </div>

            {/* Engagement Prediction */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <BarChart className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white/80">Engagement</span>
              </div>
              <span className={`text-sm font-medium ${
                initiative.aiInsights.engagementPrediction === "High" ? "text-green-400" :
                initiative.aiInsights.engagementPrediction === "Moderate" ? "text-yellow-400" :
                "text-red-400"
              }`}>
                {initiative.aiInsights.engagementPrediction}
              </span>
            </div>

            {/* Trending Topics */}
            <div>
              <p className="text-sm text-white/80 mb-2">Related Trending Topics</p>
              <div className="flex flex-wrap gap-2">
                {initiative.trendingTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs text-purple-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Similar Posts Performance */}
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-white/80 mb-2">Similar Posts Performance</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-white/60">Avg. Karma:</span>
                  <span className="ml-1 text-white">{initiative.aiInsights.similarPostsPerformance.averageKarma}</span>
                </div>
                <div>
                  <span className="text-white/60">Avg. Comments:</span>
                  <span className="ml-1 text-white">{initiative.aiInsights.similarPostsPerformance.averageComments}</span>
                </div>
              </div>
              <div className="mt-2 text-xs">
                <span className="text-white/60">Peak Time:</span>
                <span className="ml-1 text-white">{initiative.aiInsights.similarPostsPerformance.topPerformingTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="lg:col-span-2">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => router.push("/agent-dashboard")}
              className="px-6 py-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2"
              disabled={saving}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            
            <button
              onClick={() => handleSave("draft")}
              className="px-6 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-colors flex items-center gap-2"
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            
            <button
              onClick={() => handleSave("schedule")}
              className="px-6 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition-colors flex items-center gap-2"
              disabled={saving}
            >
              <Calendar className="w-4 h-4" />
              Schedule
            </button>
            
            <button
              onClick={() => handleSave("post")}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-green-500/25"
              disabled={saving}
            >
              <Send className="w-4 h-4" />
              Post Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}