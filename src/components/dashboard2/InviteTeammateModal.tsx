"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface InviteTeammateModalProps {
  brandId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteTeammateModal({
  brandId,
  isOpen,
  onClose,
}: InviteTeammateModalProps) {
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expiresInHours, setExpiresInHours] = useState<number>(72);
  const [copiedVisible, setCopiedVisible] = useState(false);
  const [copiedFading, setCopiedFading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const createInvite = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: brandId || undefined, expiresInHours }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create invite");
      setInviteUrl(data.inviteUrl);
    } catch (e: any) {
      setError(e?.message || "Failed to create invite");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async (event: React.MouseEvent) => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);

      // Capture mouse position
      setMousePosition({ x: event.clientX, y: event.clientY });

      // Show popover and fade out
      setCopiedVisible(true);
      setCopiedFading(false);

      // Trigger fade after a short delay
      const fadeTimer = setTimeout(() => setCopiedFading(true), 800);
      // Remove after fade completes
      const hideTimer = setTimeout(() => {
        setCopiedVisible(false);
        setCopiedFading(false);
      }, 1300);

      // Clean up timers if the modal closes early
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    } catch {}
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInviteUrl(null);
      setError(null);
    }
  }, [isOpen]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const overlay = (
    <div className="fixed inset-0 z-[10000]">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur p-6 rounded-lg w-full max-w-md text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Invite a teammate</h2>
            <button
              className="text-white/70 hover:text-white"
              onClick={onClose}
              aria-label="Close invite dialog"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-purple-200">
                Expires in (hours)
              </span>
              <input
                type="number"
                min={1}
                max={336}
                value={expiresInHours}
                onChange={(e) =>
                  setExpiresInHours(parseInt(e.target.value || "72", 10))
                }
                className="mt-1 w-full px-3 py-2 rounded bg-white/20 placeholder-white/40 outline-none"
              />
            </label>
            {error && <div className="text-red-300 text-sm">{error}</div>}
            {!inviteUrl ? (
              <button
                className="w-full px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                onClick={createInvite}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Invite Link"}
              </button>
            ) : (
              <div>
                <div className="text-sm text-purple-200 break-all mb-2">
                  {inviteUrl}
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700"
                    onClick={copyLink}
                  >
                    Copy Link
                  </button>
                  <a
                    className="px-4 py-2 rounded bg-white/10 hover:bg-white/20"
                    href={`mailto:?subject=Join my brand&body=Use this link to join: ${encodeURIComponent(
                      inviteUrl
                    )}`}
                  >
                    Email Link
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {copiedVisible && (
        <div
          className="fixed pointer-events-none z-[11000]"
          style={{
            left: mousePosition.x,
            top: mousePosition.y - 60,
            transform: "translateX(-50%)",
          }}
          aria-live="polite"
        >
          <div
            className={
              "px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium flex items-center gap-2 shadow-xl border-2 border-white/20 transition-all duration-500 transform " +
              (copiedFading
                ? "opacity-0 scale-75 translate-y-2"
                : "opacity-100 scale-100 translate-y-0")
            }
          >
            <span className="text-lg">🎉</span>
            <span>Copied!</span>
          </div>
        </div>
      )}
    </div>
  );

  return typeof document !== "undefined" && createPortal(overlay, document.body);
}