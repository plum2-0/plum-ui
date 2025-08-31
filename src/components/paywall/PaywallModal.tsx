"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { getStripe } from "@/lib/stripe-client";
import { PRICING_PLANS } from "@/types/subscription";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  remainingJobs?: number;
  usedJobs?: number;
  monthlyLimit?: number;
}

export function PaywallModal({
  isOpen,
  onClose,
  onSuccess,
  remainingJobs = 0,
  usedJobs = 0,
  monthlyLimit = 0,
}: PaywallModalProps) {
  const [loading, setLoading] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [testerCode, setTesterCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/subscription/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: PRICING_PLANS.pro.priceId,
          successUrl: `${window.location.origin}/dashboard/subscription-success`,
          cancelUrl: `${window.location.origin}/dashboard/leads`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        // Fallback to Stripe.js redirect if URL not provided
        const stripe = await getStripe();
        if (stripe) {
          const { sessionId } = await response.json();
          const { error } = await stripe.redirectToCheckout({ sessionId });
          if (error) {
            throw error;
          }
        }
      }
    } catch (err) {
      console.error("Subscription error:", err);
      setError("Failed to start subscription process. Please try again.");
      setLoading(false);
    }
  };

  const handleTesterCode = async () => {
    if (!testerCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tester-code/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: testerCode }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
      } else {
        setError(data.error || "Invalid or expired code");
      }
    } catch (err) {
      console.error("Tester code error:", err);
      setError("Failed to validate code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative w-full max-w-lg bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/20"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* Content */}
            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Unlock Your Prospects
                  </span>
                </h2>
              </div>

              {/* Pricing card */}
              <div className="mb-6">
                <div className="bg-gradient-to-b from-purple-900/20 to-purple-900/10 border border-purple-500/30 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        Pro Plan
                      </h3>
                      <div className="text-4xl font-bold text-purple-400">
                        $50
                        <span className="text-lg text-gray-400 font-normal">
                          /month
                        </span>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-purple-500/20 rounded-full">
                      <span className="text-xs font-semibold text-purple-300">
                        POPULAR
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {PRICING_PLANS.pro.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start text-gray-300"
                      >
                        <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing..." : "Subscribe Now"}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Tester code section */}
              <div className="border-t border-gray-700 pt-4">
                <button
                  onClick={() => setShowCodeInput(!showCodeInput)}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Have a tester code?
                </button>

                {showCodeInput && (
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={testerCode}
                      onChange={(e) =>
                        setTesterCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter code"
                      className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder:text-gray-500"
                      disabled={loading}
                    />
                    <button
                      onClick={handleTesterCode}
                      disabled={loading || !testerCode.trim()}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
