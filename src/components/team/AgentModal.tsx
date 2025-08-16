"use client";

import { useState, useEffect } from "react";
import { Agent, CreateAgentRequest } from "@/types/agent";
import { useCreateAgent, useUpdateAgent } from "@/hooks/api/useAgentQueries";
import { AvatarGenerator, avatarStyles, AvatarStyle } from "@/lib/avatar";
import Image from "next/image";

interface AgentModalProps {
  isOpen: boolean;
  agent?: Agent;
  onClose: () => void;
  onSave?: (agent: Agent) => void;
}

export default function AgentModal({
  isOpen,
  agent,
  onClose,
  onSave,
}: AgentModalProps) {
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();

  const [formData, setFormData] = useState({
    name: "",
    persona: "",
    goal: "",
    avatarUrl: "",
    avatarStyle: "avataaars" as AvatarStyle,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarVariations, setAvatarVariations] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  const isEditMode = !!agent;

  // Initialize form when agent prop changes
  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        persona: agent.persona,
        goal: agent.goal,
        avatarUrl: agent.avatar || "",
        avatarStyle: "avataaars" as AvatarStyle,
      });
      setSelectedAvatar(agent.avatar || "");
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        persona: "",
        goal: "",
        avatarUrl: "",
        avatarStyle: "avataaars" as AvatarStyle,
      });
      setSelectedAvatar("");
    }
  }, [agent]);

  // Generate avatar when name changes
  useEffect(() => {
    if (formData.name && !isEditMode) {
      const avatarUrl = AvatarGenerator.generateUrl({
        seed: formData.name,
        style: formData.avatarStyle,
        size: 256,
      });
      setSelectedAvatar(avatarUrl);
      setFormData((prev) => ({ ...prev, avatarUrl }));
    }
  }, [formData.name, formData.avatarStyle, isEditMode]);

  const generateAvatarVariations = () => {
    const variations = AvatarGenerator.generateVariations(
      formData.name || "agent",
      6,
      formData.avatarStyle
    );
    setAvatarVariations(variations);
    setShowAvatarOptions(true);
  };

  const selectAvatar = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    setFormData((prev) => ({ ...prev, avatarUrl }));
    setShowAvatarOptions(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    } else if (formData.name.length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    if (!formData.persona.trim()) {
      newErrors.persona = "Persona is required";
    } else if (formData.persona.length < 10) {
      newErrors.persona = "Persona must be at least 10 characters";
    }

    if (!formData.goal.trim()) {
      newErrors.goal = "Goal is required";
    } else if (formData.goal.length < 10) {
      newErrors.goal = "Goal must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode && agent) {
        const updated = await updateAgent.mutateAsync({
          agentId: agent.id,
          data: formData,
        });
        onSave?.(updated);
      } else {
        const request: CreateAgentRequest = {
          name: formData.name,
          persona: formData.persona,
          goal: formData.goal,
          avatarUrl: formData.avatarUrl,
          avatarStyle: formData.avatarStyle,
        };
        const created = await createAgent.mutateAsync(request);
        onSave?.(created);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save agent:", error);
      setErrors({ submit: "Failed to save agent. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl rounded-t-3xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto"
        style={{
          background:
            "linear-gradient(135deg, rgba(20, 20, 30, 0.95) 0%, rgba(30, 30, 45, 0.95) 100%)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderBottom: "none",
          boxShadow: "0 -20px 60px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold text-white">
            {isEditMode ? "Edit Agent" : "Create New Agent"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Avatar Section */}
        <div className="mb-6">
          <label className="text-white/80 text-sm font-body mb-3 block">
            Agent Avatar
          </label>
          <div className="flex items-center gap-4">
            {/* Avatar Preview */}
            <div className="relative">
              {selectedAvatar ? (
                <Image
                  src={selectedAvatar}
                  alt="Agent Avatar"
                  width={80}
                  height={80}
                  className="rounded-full"
                  style={{
                    border: "2px solid rgba(168, 85, 247, 0.5)",
                    boxShadow: "0 4px 12px rgba(168, 85, 247, 0.2)",
                  }}
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(34, 197, 94, 0.8))",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                  }}
                >
                  {formData.name ? formData.name.charAt(0).toUpperCase() : "?"}
                </div>
              )}
            </div>

            {/* Avatar Actions */}
            <div className="flex-1 space-y-2">
              {/* Style Selector */}
              <select
                value={formData.avatarStyle}
                onChange={(e) => {
                  const newStyle = e.target.value as AvatarStyle;
                  setFormData((prev) => ({ ...prev, avatarStyle: newStyle }));
                }}
                className="px-3 py-2 rounded-lg text-white bg-white/10 border border-white/20 text-sm"
                disabled={!formData.name}
              >
                {avatarStyles.map((style) => (
                  <option
                    key={style.value}
                    value={style.value}
                    className="bg-gray-900"
                  >
                    {style.label}
                  </option>
                ))}
              </select>

              {/* Generate Variations Button */}
              <button
                type="button"
                onClick={generateAvatarVariations}
                disabled={!formData.name}
                className="px-4 py-2 rounded-lg text-white text-sm transition-all hover:scale-105 disabled:opacity-50"
                style={{
                  background: "rgba(168, 85, 247, 0.2)",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                }}
              >
                Generate Variations
              </button>
            </div>
          </div>

          {/* Avatar Variations */}
          {showAvatarOptions && avatarVariations.length > 0 && (
            <div
              className="mt-4 p-4 rounded-xl"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <p className="text-white/60 text-xs mb-3">
                Select an avatar variation:
              </p>
              <div className="grid grid-cols-6 gap-2">
                {avatarVariations.map((avatarUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectAvatar(avatarUrl)}
                    className="relative rounded-lg overflow-hidden transition-all hover:scale-110"
                    style={{
                      border:
                        selectedAvatar === avatarUrl
                          ? "2px solid rgba(168, 85, 247, 0.8)"
                          : "2px solid transparent",
                    }}
                  >
                    <Image
                      src={avatarUrl}
                      alt={`Variation ${index + 1}`}
                      width={60}
                      height={60}
                      className="rounded-lg"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="text-white/80 text-sm font-body mb-2 block">
              Agent Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Sarah - Support Hero"
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 font-body transition-all"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: errors.name
                  ? "1px solid rgba(239, 68, 68, 0.5)"
                  : "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1 font-body">
                {errors.name}
              </p>
            )}
            <p className="text-white/40 text-xs mt-1 font-body">
              {formData.name.length}/50 characters
            </p>
          </div>

          {/* Persona Field */}
          <div>
            <label className="text-white/80 text-sm font-body mb-2 block">
              Agent Persona
            </label>
            <textarea
              value={formData.persona}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, persona: e.target.value }))
              }
              placeholder="Describe how this agent should behave and communicate..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 font-body transition-all resize-none"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: errors.persona
                  ? "1px solid rgba(239, 68, 68, 0.5)"
                  : "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            />
            {errors.persona && (
              <p className="text-red-400 text-xs mt-1 font-body">
                {errors.persona}
              </p>
            )}
            <p className="text-white/40 text-xs mt-1 font-body">
              {formData.persona.length} characters
            </p>
          </div>

          {/* Goal Field */}
          <div>
            <label className="text-white/80 text-sm font-body mb-2 block">
              Agent Goal
            </label>
            <textarea
              value={formData.goal}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, goal: e.target.value }))
              }
              placeholder="What should this agent aim to achieve?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 font-body transition-all resize-none"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: errors.goal
                  ? "1px solid rgba(239, 68, 68, 0.5)"
                  : "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            />
            {errors.goal && (
              <p className="text-red-400 text-xs mt-1 font-body">
                {errors.goal}
              </p>
            )}
            <p className="text-white/40 text-xs mt-1 font-body">
              {formData.goal.length} characters
            </p>
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-red-400 text-sm font-body">{errors.submit}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl font-body font-medium text-white transition-all hover:scale-105"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-xl font-body font-medium text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:
                "linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(34, 197, 94, 0.8))",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 4px 15px rgba(168, 85, 247, 0.3)",
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : isEditMode ? (
              "Update Agent"
            ) : (
              "Create Agent"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
