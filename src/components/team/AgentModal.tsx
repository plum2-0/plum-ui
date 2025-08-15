"use client";

import { useState, useEffect } from "react";
import { Agent, AgentTemplate, CreateAgentRequest, UpdateAgentRequest } from "@/types/agent";
import { useAgentTemplates, useCreateAgent, useUpdateAgent } from "@/hooks/api/useAgentQueries";

interface AgentModalProps {
  isOpen: boolean;
  agent?: Agent;
  onClose: () => void;
  onSave?: (agent: Agent) => void;
}

export default function AgentModal({ isOpen, agent, onClose, onSave }: AgentModalProps) {
  const { data: templatesData, isLoading: templatesLoading } = useAgentTemplates();
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();
  
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    persona: "",
    goal: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const templates = templatesData?.templates || [];
  const isEditMode = !!agent;

  // Initialize form when agent prop changes
  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        persona: agent.persona,
        goal: agent.goal,
      });
      // Find matching template if exists
      const matchingTemplate = templates.find(t => t.id === agent.templateId);
      setSelectedTemplate(matchingTemplate || null);
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        persona: "",
        goal: "",
      });
      setSelectedTemplate(null);
    }
  }, [agent, templates]);

  // Update form when template is selected
  useEffect(() => {
    if (selectedTemplate && !isEditMode) {
      setFormData(prev => ({
        ...prev,
        persona: selectedTemplate.defaultPersona,
        goal: selectedTemplate.defaultGoal,
      }));
    }
  }, [selectedTemplate, isEditMode]);

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
          ...formData,
          templateId: selectedTemplate?.id,
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
          background: "linear-gradient(135deg, rgba(20, 20, 30, 0.95) 0%, rgba(30, 30, 45, 0.95) 100%)",
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
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Template Selection (Create Mode Only) */}
        {!isEditMode && !templatesLoading && (
          <div className="mb-6">
            <label className="text-white/80 text-sm font-body mb-3 block">
              Choose a template to get started
            </label>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className="p-4 rounded-xl text-left transition-all duration-300"
                  style={{
                    background: selectedTemplate?.id === template.id
                      ? "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(34, 197, 94, 0.2))"
                      : "rgba(255, 255, 255, 0.05)",
                    border: selectedTemplate?.id === template.id
                      ? "2px solid rgba(168, 85, 247, 0.5)"
                      : "2px solid rgba(255, 255, 255, 0.1)",
                    transform: selectedTemplate?.id === template.id ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{template.emoji}</span>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm font-heading">
                        {template.name}
                      </h4>
                      <p className="text-white/60 text-xs font-body mt-1">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

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
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Sarah - Support Hero"
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 font-body transition-all"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: errors.name ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1 font-body">{errors.name}</p>
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
              onChange={(e) => setFormData(prev => ({ ...prev, persona: e.target.value }))}
              placeholder="Describe how this agent should behave and communicate..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 font-body transition-all resize-none"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: errors.persona ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            />
            {errors.persona && (
              <p className="text-red-400 text-xs mt-1 font-body">{errors.persona}</p>
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
              onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
              placeholder="What should this agent aim to achieve?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 font-body transition-all resize-none"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: errors.goal ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            />
            {errors.goal && (
              <p className="text-red-400 text-xs mt-1 font-body">{errors.goal}</p>
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
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(34, 197, 94, 0.8))",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 4px 15px rgba(168, 85, 247, 0.3)",
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              isEditMode ? "Update Agent" : "Create Agent"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}