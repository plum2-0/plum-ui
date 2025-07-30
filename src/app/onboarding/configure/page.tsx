"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";
import { PlumLogo } from "@/components/PlumLogo";

export default function ConfigureOnboardingPage() {
  const { data: session, status } = useSession();
  const [subreddits, setSubreddits] = useState([""]);
  const [keywords, setKeywords] = useState([""]);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      redirect("/auth/signin");
    }

    // Load existing data from localStorage
    const savedData = localStorage.getItem("onboardingData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setProjectName(parsedData.projectName || "");
    }
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700" />
    );
  }

  if (!session?.user) {
    return null;
  }

  const addSubreddit = () => {
    setSubreddits([...subreddits, ""]);
  };

  const removeSubreddit = (index: number) => {
    if (subreddits.length > 1) {
      setSubreddits(subreddits.filter((_, i) => i !== index));
    }
  };

  const updateSubreddit = (index: number, value: string) => {
    const newSubreddits = [...subreddits];
    newSubreddits[index] = value;
    setSubreddits(newSubreddits);
  };

  const addKeyword = () => {
    setKeywords([...keywords, ""]);
  };

  const removeKeyword = (index: number) => {
    if (keywords.length > 1) {
      setKeywords(keywords.filter((_, i) => i !== index));
    }
  };

  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const handleFinish = async () => {
    // Save configuration
    const configData = {
      projectName,
      subreddits: subreddits.filter((s) => s.trim()),
      keywords: keywords.filter((k) => k.trim()),
      redditConnected: true,
    };

    localStorage.setItem("onboardingData", JSON.stringify(configData));

    // TODO: Send configuration to backend API
    console.log("Configuration saved:", configData);

    // Navigate to dashboard or success page
    redirect("/");
  };

  const isValid =
    subreddits.some((s) => s.trim()) && keywords.some((k) => k.trim());

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700">
      <header className="p-6 flex justify-between items-center">
        <PlumLogo />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-white">{session.user.name}</span>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">
            Configure Your Monitoring
          </h1>
          <p className="text-xl text-purple-100 mb-12">
            Set up which subreddits to monitor and what keywords to watch for.
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/60 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  ✓
                </div>
                <div className="flex-1 h-1 bg-white/30 mx-2"></div>
              </div>
              <p className="text-white/80 mt-2">Account Created</p>
            </div>

            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/60 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  ✓
                </div>
                <div className="flex-1 h-1 bg-white/30 mx-2"></div>
              </div>
              <p className="text-white/80 mt-2">Connect Reddit</p>
            </div>

            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold">
                  3
                </div>
              </div>
              <p className="text-white mt-2">Configure</p>
            </div>
          </div>

          {/* Current Step Content */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Step 3: Configuration Wizard
            </h2>

            <div className="space-y-8">
              {/* Project Name Display */}
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Project Name
                </h3>
                <p className="text-purple-100">{projectName}</p>
              </div>

              {/* Subreddits Configuration */}
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Subreddits to Monitor
                </h3>
                <p className="text-purple-100 mb-4">
                  Enter the subreddits you want to monitor (without the "r/"
                  prefix)
                </p>

                <div className="space-y-3">
                  {subreddits.map((subreddit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-white">r/</span>
                      <input
                        type="text"
                        value={subreddit}
                        onChange={(e) => updateSubreddit(index, e.target.value)}
                        placeholder="e.g., startups, entrepreneur"
                        className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-purple-200 border border-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
                      />
                      {subreddits.length > 1 && (
                        <button
                          onClick={() => removeSubreddit(index)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addSubreddit}
                    className="text-purple-200 hover:text-white transition-colors"
                  >
                    + Add another subreddit
                  </button>
                </div>
              </div>

              {/* Keywords Configuration */}
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Keywords to Watch
                </h3>
                <p className="text-purple-100 mb-4">
                  Enter keywords related to your brand, product, or topics of
                  interest
                </p>

                <div className="space-y-3">
                  {keywords.map((keyword, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => updateKeyword(index, e.target.value)}
                        placeholder="e.g., your brand name, product category"
                        className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-purple-200 border border-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
                      />
                      {keywords.length > 1 && (
                        <button
                          onClick={() => removeKeyword(index)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addKeyword}
                    className="text-purple-200 hover:text-white transition-colors"
                  >
                    + Add another keyword
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => redirect("/onboarding/reddit")}
                className="text-white/70 hover:text-white transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={handleFinish}
                disabled={!isValid}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                Finish Setup
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
