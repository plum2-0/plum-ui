import { useState, useEffect } from "react";
import { Brand } from "@/types/brand";
import { clearRedditAuthCache } from "@/lib/verify-reddit";
import { Popover } from "@/components/ui/Popover";

interface RedditConfigProps {
  brand: Brand | null;
  onUpdate: (brand: Brand) => void;
}

interface Subreddit {
  name: string;
  subscribers: number;
  isModerated: boolean;
}

export default function RedditConfig({ brand, onUpdate }: RedditConfigProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isFetchingSubreddits, setIsFetchingSubreddits] = useState(false);
  const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
  const [selectedSubreddit, setSelectedSubreddit] = useState<string>("");
  const [linkedSubreddit, setLinkedSubreddit] = useState<string>(
    brand?.source?.reddit?.connected_subreddit || ""
  );
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isConnected = brand?.source?.reddit?.oauth_token ? true : false;
  const username = brand?.source?.reddit?.username || null;

  useEffect(() => {
    if (isConnected && !subreddits.length) {
      fetchModeratedSubreddits();
    }
  }, [isConnected]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/connections/reddit/connect");
      if (!response.ok) {
        throw new Error("Failed to initiate Reddit connection");
      }

      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error connecting to Reddit:", error);
      setMessage({ type: "error", text: "Failed to connect to Reddit" });
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your Reddit account?")) {
      return;
    }

    setIsDisconnecting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/brand/sources/reddit/disconnect", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect Reddit account");
      }

      const result = await response.json();
      onUpdate(result.brand);
      setSubreddits([]);
      setSelectedSubreddit("");
      setLinkedSubreddit("");
      
      // Clear Reddit auth cache from sessionStorage
      clearRedditAuthCache();
      
      setMessage({ type: "success", text: "Reddit account disconnected successfully" });
    } catch (error) {
      console.error("Error disconnecting Reddit:", error);
      setMessage({ type: "error", text: "Failed to disconnect Reddit account" });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const fetchModeratedSubreddits = async () => {
    setIsFetchingSubreddits(true);
    setMessage(null);

    try {
      const response = await fetch("/api/brand/sources/reddit/subreddits");
      if (!response.ok) {
        throw new Error("Failed to fetch subreddits");
      }

      const { subreddits } = await response.json();
      setSubreddits(subreddits);
      
      // Pre-select the currently linked subreddit if it exists
      if (brand?.source?.reddit?.connected_subreddit) {
        setSelectedSubreddit(brand.source.reddit.connected_subreddit);
      }
    } catch (error) {
      console.error("Error fetching subreddits:", error);
      setMessage({ type: "error", text: "Failed to fetch your moderated subreddits" });
    } finally {
      setIsFetchingSubreddits(false);
    }
  };

  const handleLinkSubreddit = async () => {
    if (!selectedSubreddit) {
      setMessage({ type: "error", text: "Please select a subreddit to link" });
      return;
    }

    setMessage(null);

    try {
      const response = await fetch("/api/brand/sources/reddit/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subreddit: selectedSubreddit }),
      });

      if (!response.ok) {
        throw new Error("Failed to link subreddit");
      }

      const result = await response.json();
      onUpdate(result.brand);
      setLinkedSubreddit(selectedSubreddit);
      setMessage({ type: "success", text: `Successfully linked r/${selectedSubreddit}` });
    } catch (error) {
      console.error("Error linking subreddit:", error);
      setMessage({ type: "error", text: "Failed to link subreddit" });
    }
  };

  if (!isConnected) {
    return (
      <div className="pt-6 space-y-4">
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-yellow-400 font-body font-medium">No Reddit account connected</p>
              <p className="text-white/60 text-sm font-body mt-1">
                Connect your Reddit account to start monitoring conversations about your brand across Reddit communities.
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          } font-body text-sm`}>
            {message.text}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="px-6 py-2 rounded-lg glass-button text-white font-body font-medium hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isConnecting ? (
              <>
                <span className="animate-spin">⏳</span>
                Connecting...
              </>
            ) : (
              <>
                Connect Reddit Account
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
          
          <Popover
            trigger={
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center cursor-help hover:bg-white/20 transition-all">
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            }
            contentClassName="w-80"
            align="start"
            side="top"
          >
            <div className="space-y-3">
              <h4 className="font-body font-semibold text-white text-sm">
                Why connect Reddit?
              </h4>
              <div className="space-y-2 text-white/80 text-xs font-body">
                <p>🔍 <strong>Monitor Conversations:</strong> Track mentions of your brand and relevant discussions across Reddit communities.</p>
                <p>💬 <strong>Engage Authentically:</strong> Reply to posts and comments directly from PlumSprout.</p>
                <p>📊 <strong>Analytics:</strong> Get insights on engagement and sentiment around your brand.</p>
                <p>🎯 <strong>Find Opportunities:</strong> Discover where your target audience is asking questions you can answer.</p>
              </div>
              <p className="text-white/60 text-xs font-body pt-2 border-t border-white/10">
                We only request read permissions and never post without your explicit action.
              </p>
            </div>
          </Popover>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-body">
            Connected as: <span className="text-green-400">u/{username}</span>
          </p>
          {linkedSubreddit && (
            <p className="text-white/60 text-sm font-body mt-1">
              Linked subreddit: <span className="text-white">r/{linkedSubreddit}</span>
            </p>
          )}
        </div>
        <button
          onClick={handleDisconnect}
          disabled={isDisconnecting}
          className="px-4 py-1.5 rounded-lg bg-red-500/20 text-red-400 font-body text-sm hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDisconnecting ? "Disconnecting..." : "Disconnect Account"}
        </button>
      </div>

      <div className="border-t border-white/10 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-white font-body font-medium">Link Your Subreddit</h3>
          <Popover
            trigger={
              <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center cursor-help hover:bg-white/20 transition-all">
                <svg className="w-3 h-3 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            }
            contentClassName="w-72"
            align="start"
            side="right"
          >
            <div className="space-y-2">
              <h4 className="font-body font-semibold text-white text-sm">
                What is subreddit linking?
              </h4>
              <p className="text-white/80 text-xs font-body">
                Linking your subreddit allows PlumSprout to:
              </p>
              <ul className="text-white/70 text-xs font-body space-y-1 ml-3">
                <li>• Monitor discussions in your community</li>
                <li>• Track engagement metrics</li>
                <li>• Identify trending topics</li>
                <li>• Manage community interactions</li>
              </ul>
              <p className="text-white/60 text-xs font-body pt-2 border-t border-white/10">
                You must be a moderator of the subreddit to link it.
              </p>
            </div>
          </Popover>
        </div>
        <p className="text-white/60 text-sm font-body mb-4">
          Select a subreddit you moderate to link with your brand:
        </p>

        {isFetchingSubreddits ? (
          <div className="py-8 text-center">
            <div className="animate-spin text-2xl mb-2">⏳</div>
            <p className="text-white/60 font-body text-sm">Fetching your moderated subreddits...</p>
          </div>
        ) : subreddits.length === 0 ? (
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-yellow-400 font-body text-sm">
              You don't moderate any subreddits. To link a subreddit, you need to be a moderator.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {subreddits.map((sub) => (
                <label
                  key={sub.name}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedSubreddit === sub.name
                      ? "bg-white/10 border border-white/20"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="subreddit"
                    value={sub.name}
                    checked={selectedSubreddit === sub.name}
                    onChange={(e) => setSelectedSubreddit(e.target.value)}
                    className="text-blue-500"
                  />
                  <div className="flex-1">
                    <p className="text-white font-body">r/{sub.name}</p>
                    <p className="text-white/40 text-xs font-body">
                      {sub.subscribers.toLocaleString()} subscribers
                    </p>
                  </div>
                  {linkedSubreddit === sub.name && (
                    <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 font-body">
                      Currently Linked
                    </span>
                  )}
                </label>
              ))}
            </div>

            <button
              onClick={handleLinkSubreddit}
              disabled={!selectedSubreddit || selectedSubreddit === linkedSubreddit}
              className="px-6 py-2 rounded-lg glass-button text-white font-body font-medium hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedSubreddit === linkedSubreddit ? "Already Linked" : "Update Linked Subreddit"}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
        } font-body text-sm`}>
          {message.text}
        </div>
      )}

      <style jsx>{`
        .glass-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}