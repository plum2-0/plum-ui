"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { SubredditAutocomplete } from "./SubredditAutocomplete";

interface SourceListeningConfigProps {
  projectId: string;
  onConfigChange?: (config: {
    subreddits: string[];
    topics: string[];
    prompt: string;
  }) => void;
}

interface SourceConfigurationState {
  subreddits: string[];
  topics: string[];
  prompt: string;
  isLoading: boolean;
  errors: {
    subreddits?: string;
    topics?: string;
    prompt?: string;
  };
  configId: string | null;
  isSaving: boolean;
  lastSaved: Date | null;
}

export function SourceListeningConfig({
  projectId,
  onConfigChange,
}: SourceListeningConfigProps) {
  const [state, setState] = useState<SourceConfigurationState>({
    subreddits: [],
    topics: [],
    prompt: "",
    isLoading: true,
    errors: {},
    configId: null,
    isSaving: false,
    lastSaved: null,
  });

  const [newSubredditInput, setNewSubredditInput] = useState("");
  const [newTopicInput, setNewTopicInput] = useState("");

  // Use a ref to store the callback to avoid re-running effects
  const onConfigChangeRef = useRef(onConfigChange);
  onConfigChangeRef.current = onConfigChange;

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        // Load subreddits
        const subredditsResponse = await fetch(
          `/api/projects/${projectId}/subreddits`
        );
        const subredditsData = await subredditsResponse.json();

        // Load configs
        const configsResponse = await fetch(
          `/api/projects/${projectId}/configs`
        );
        const configsData = await configsResponse.json();

        // Use the first config if it exists, or set up for creating new one
        const configs = configsData.configs || {};
        const firstConfigId = Object.keys(configs)[0];
        const firstConfig = firstConfigId ? configs[firstConfigId] : null;

        setState((prev) => ({
          ...prev,
          subreddits: subredditsData.subreddits || [],
          topics: firstConfig?.topics || [],
          prompt: firstConfig?.prompt || "",
          configId: firstConfigId || null,
          isLoading: false,
        }));

        // Notify parent of initial state
        if (onConfigChangeRef.current) {
          onConfigChangeRef.current({
            subreddits: subredditsData.subreddits || [],
            topics: firstConfig?.topics || [],
            prompt: firstConfig?.prompt || "",
          });
        }
      } catch (error) {
        console.error("Error loading configuration:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          errors: { subreddits: "Failed to load configuration" },
        }));
      }
    };

    loadData();
  }, [projectId]);

  // Subreddit management
  const addSubreddit = async (subredditName: string) => {
    if (!subredditName.trim()) return;

    try {
      setState((prev) => ({
        ...prev,
        errors: { ...prev.errors, subreddits: undefined },
      }));

      const response = await fetch(`/api/projects/${projectId}/subreddits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subreddit: subredditName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            subreddits: data.error || "Failed to add subreddit",
          },
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        subreddits: data.subreddits,
      }));

      // Clear input on successful add
      setNewSubredditInput("");

      // Notify parent
      if (onConfigChangeRef.current) {
        onConfigChangeRef.current({
          subreddits: data.subreddits,
          topics: state.topics,
          prompt: state.prompt,
        });
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        errors: { ...prev.errors, subreddits: "Network error" },
      }));
    }
  };

  const removeSubreddit = async (subredditName: string) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/subreddits/${subredditName}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        setState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            subreddits: data.error || "Failed to remove subreddit",
          },
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        subreddits: data.subreddits,
      }));

      // Notify parent
      if (onConfigChangeRef.current) {
        onConfigChangeRef.current({
          subreddits: data.subreddits,
          topics: state.topics,
          prompt: state.prompt,
        });
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        errors: { ...prev.errors, subreddits: "Network error" },
      }));
    }
  };

  // Topic management
  const ensureConfigExists = async () => {
    if (state.configId) return state.configId;

    try {
      const response = await fetch(`/api/projects/${projectId}/configs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics: [],
          prompt: "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create config");
      }

      setState((prev) => ({ ...prev, configId: data.configId }));
      return data.configId;
    } catch (error) {
      console.error("Error creating config:", error);
      throw error;
    }
  };

  const updateTopics = async (newTopics: string[]) => {
    try {
      setState((prev) => ({
        ...prev,
        errors: { ...prev.errors, topics: undefined },
      }));

      const configId = await ensureConfigExists();

      const response = await fetch(
        `/api/projects/${projectId}/configs/${configId}/topics`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topics: newTopics }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            topics: data.error || "Failed to update topics",
          },
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        topics: data.topics,
      }));

      // Notify parent
      if (onConfigChangeRef.current) {
        onConfigChangeRef.current({
          subreddits: state.subreddits,
          topics: data.topics,
          prompt: state.prompt,
        });
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        errors: { ...prev.errors, topics: "Network error" },
      }));
    }
  };

  const addTopic = () => {
    if (!newTopicInput.trim()) return;

    if (newTopicInput.trim().length > 200) {
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          topics: "Topic must be under 200 characters",
        },
      }));
      return;
    }

    if (state.topics.includes(newTopicInput.trim())) {
      setState((prev) => ({
        ...prev,
        errors: { ...prev.errors, topics: "Topic already added" },
      }));
      return;
    }

    const newTopics = [...state.topics, newTopicInput.trim()];
    updateTopics(newTopics);
    setNewTopicInput("");
  };

  const removeTopic = (topicToRemove: string) => {
    const newTopics = state.topics.filter((topic) => topic !== topicToRemove);
    updateTopics(newTopics);
  };

  // Prompt management
  const updatePrompt = useCallback(
    async (newPrompt: string) => {
      try {
        setState((prev) => ({
          ...prev,
          isSaving: true,
          errors: { ...prev.errors, prompt: undefined },
        }));

        const configId = await ensureConfigExists();

        const response = await fetch(
          `/api/projects/${projectId}/configs/${configId}/prompt`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: newPrompt }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setState((prev) => ({
            ...prev,
            errors: {
              ...prev.errors,
              prompt: data.error || "Failed to update prompt",
            },
            isSaving: false,
          }));
          return;
        }

        setState((prev) => ({
          ...prev,
          prompt: data.prompt,
          lastSaved: new Date(),
          isSaving: false,
        }));

        // Notify parent
        if (onConfigChangeRef.current) {
          onConfigChangeRef.current({
            subreddits: state.subreddits,
            topics: state.topics,
            prompt: data.prompt,
          });
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          errors: { ...prev.errors, prompt: "Network error" },
          isSaving: false,
        }));
      }
    },
    [projectId, state.configId, state.subreddits, state.topics]
  );

  const handlePromptBlur = () => {
    updatePrompt(state.prompt);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;

    if (newPrompt.length > 2000) {
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          prompt: "Prompt must be under 2000 characters",
        },
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      prompt: newPrompt,
      errors: { ...prev.errors, prompt: undefined },
    }));
  };

  if (state.isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
        <div className="text-white text-center">Loading configuration...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">
          Configure Your Reddit Listening
        </h1>
        <p className="text-purple-100">
          Set up subreddits to monitor, define topics of interest, and craft
          your response prompts
        </p>
      </div>

      {/* Subreddit Selection Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📋</span>
          <h2 className="text-xl font-semibold text-white">
            Select Subreddits to Monitor
          </h2>
        </div>

        <div className="mb-4">
          <div className="mb-3">
            <SubredditAutocomplete
              value={newSubredditInput}
              onChange={(value) => {
                if (value && value.trim()) {
                  addSubreddit(value);
                  setNewSubredditInput("");
                } else {
                  setNewSubredditInput(value);
                }
              }}
              placeholder="Search and select a subreddit to add..."
            />
          </div>

          {state.errors.subreddits && (
            <p className="text-red-400 text-sm mb-3">
              {state.errors.subreddits}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {state.subreddits.map((subreddit) => (
              <div
                key={subreddit}
                className="flex items-center gap-2 bg-purple-600/30 text-white px-3 py-1 rounded-full"
              >
                <span>r/{subreddit}</span>
                <button
                  onClick={() => removeSubreddit(subreddit)}
                  className="text-red-300 hover:text-red-100 ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {state.subreddits.length === 0 && (
            <p className="text-purple-200 text-sm mt-2">
              No subreddits added yet
            </p>
          )}
        </div>
      </div>

      {/* Topic Configuration Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🎯</span>
          <div>
            <h2 className="text-xl font-semibold text-white">
              What topics do you want to talk to others about
            </h2>
            <p className="text-purple-200 text-sm">
              Plum will listen to the subreddits and talk to others about the
              topics listed below
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              value={newTopicInput}
              onChange={(e) => setNewTopicInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTopic()}
              placeholder="e.g., AI, Machine Learning, Web Development"
              className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-purple-200 border border-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              onClick={addTopic}
              disabled={!newTopicInput.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              Add Topic
            </button>
          </div>

          {state.errors.topics && (
            <p className="text-red-400 text-sm mb-3">{state.errors.topics}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {state.topics.map((topic) => (
              <div
                key={topic}
                className="flex items-center gap-2 bg-green-600/30 text-white px-3 py-1 rounded-full"
              >
                <span>{topic}</span>
                <button
                  onClick={() => removeTopic(topic)}
                  className="text-red-300 hover:text-red-100 ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {state.topics.length === 0 && (
            <p className="text-purple-200 text-sm mt-2">No topics added yet</p>
          )}
        </div>
      </div>

      {/* Prompt Configuration Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">💬</span>
          <h2 className="text-xl font-semibold text-white">
            What do you want to say to people when these topics come up
          </h2>
        </div>

        <div className="mb-4">
          <textarea
            value={state.prompt}
            onChange={handlePromptChange}
            onBlur={handlePromptBlur}
            placeholder="I'd love to discuss this topic further. As someone interested in [topic], I think..."
            rows={8}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-200 border border-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30 resize-vertical"
          />

          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-4">
              {state.errors.prompt && (
                <p className="text-red-400 text-sm">{state.errors.prompt}</p>
              )}
              {state.isSaving && (
                <p className="text-blue-300 text-sm">Saving...</p>
              )}
              {state.lastSaved && !state.isSaving && (
                <p className="text-green-300 text-sm">
                  Saved at {state.lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
            <p className="text-purple-300 text-sm">
              {state.prompt.length}/2000 characters
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
