"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GlassInput } from "@/components/ui/GlassInput";
import { useToast } from "@/components/ui/Toast";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userId: string;
  brandId?: string | null;
}

type TicketCategory = "bug" | "feature_request" | "account" | "billing" | "other";

export default function SupportModal({
  isOpen,
  onClose,
  userEmail,
  userId,
  brandId,
}: SupportModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TicketCategory>("other");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubject("");
      setDescription("");
      setCategory("other");
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !description.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/support/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          description,
          category,
          userId,
          userEmail,
          brandId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create support ticket");
      }

      setSuccess(true);
      showToast({ message: "Support ticket created successfully!", type: "success" });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (e: any) {
      setError(e?.message || "Failed to create support ticket");
      showToast({ message: e?.message || "Failed to create support ticket", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[10000] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="relative w-full max-w-md rounded-2xl p-6"
          style={{
            background: "rgba(17, 17, 27, 0.95)",
            boxShadow:
              "0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Get Support
            </h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
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

          {success ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-white/80 font-body">
                Your support ticket has been created successfully!
              </p>
              <p className="text-white/60 text-sm mt-2">
                We'll get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Selector */}
              <div>
                <label className="block text-white/80 text-sm font-body mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as TicketCategory)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/90 font-body focus:outline-none focus:border-purple-400/50 transition-colors"
                >
                  <option value="bug">Bug Report</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="account">Account Issue</option>
                  <option value="billing">Billing Question</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-white/80 text-sm font-body mb-2">
                  Subject <span className="text-red-400">*</span>
                </label>
                <GlassInput
                  value={subject}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="w-full"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white/80 text-sm font-body mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                  placeholder="Please provide details about your issue or feedback..."
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/90 font-body placeholder-white/30 focus:outline-none focus:border-purple-400/50 transition-colors resize-none"
                  rows={5}
                  required
                />
              </div>

              {/* User Info Display */}
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white/60 text-xs font-body">
                  Submitting as: {userEmail}
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-red-400 text-sm font-body">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 font-body transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-body transition-opacity disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document root
  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
}