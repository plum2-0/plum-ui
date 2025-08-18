"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

interface BrandOffering {
  title: string;
  description: string;
}

interface BrandGenerationResponse {
  brand_description: string;
  target_problems: string[];
  offerings: BrandOffering[];
}

function OnboardingContent() {
  const { data: session, status } = useSession();
  // Auto-redirect users to the correct onboarding step or dashboard if complete
  useOnboardingState(true);
  const router = useRouter();
  const [phase, setPhase] = useState<"website" | "details">("website");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [formData, setFormData] = useState({
    brandName: "",
    brandDescription: "",
    problems: [""],
    offerings: [] as BrandOffering[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  useEffect(() => {
    if (isSubmitting || isGenerating) {
      const messages = isGenerating
        ? [
            "🔍 Analyzing your website...",
            "🤖 Understanding your brand...",
            "✨ Extracting key information...",
            "📊 Identifying your offerings...",
            "🎯 Finding target problems...",
          ]
        : [
            "🚀 Setting up your brand profile...",
            "🔍 Analyzing your brand information...",
            "🎯 Configuring your monitoring preferences...",
            "✨ Preparing your dashboard...",
            "🎉 Almost there! Finalizing setup...",
          ];

      let messageIndex = 0;
      setLoadingMessage(messages[0]);

      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingMessage(messages[messageIndex]);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isSubmitting, isGenerating]);

  useEffect(() => {
    if (status === "loading") return;

    // Load existing data from localStorage
    const savedData = localStorage.getItem("onboardingData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.websiteUrl) {
          setWebsiteUrl(parsedData.websiteUrl);
        }
        if (parsedData.brandName || parsedData.brandDescription) {
          setFormData((prev) => ({
            ...prev,
            ...parsedData,
          }));
          setPhase("details");
        }
      } catch (error) {
        console.error("Failed to parse saved onboarding data:", error);
      }
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3), transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.2), transparent 50%),
              linear-gradient(135deg, #0F0F23 0%, #1A0B2E 25%, #2D1B3D 50%, #1E293B 75%, #0F172A 100%)
            `,
          }}
        />
        <div className="text-white text-xl relative z-10">Loading...</div>
      </div>
    );
  }

  // Guard handles redirect; avoid flashing content when unauthenticated
  if (!session?.user) return null;

  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleWebsiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUrl(websiteUrl)) {
      setGenerationError(
        "Please enter a valid URL (e.g., https://example.com)"
      );
      return;
    }

    setIsGenerating(true);
    setGenerationError("");

    try {
      // Call the brand generation API
      const response = await fetch(
        `/api/brand/generate/web?web_url=${encodeURIComponent(websiteUrl)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze website");
      }

      const data: BrandGenerationResponse = await response.json();

      // Extract brand name from URL
      const url = new URL(websiteUrl);
      const brandName =
        url.hostname
          .replace(/^www\./, "")
          .split(".")[0]
          .charAt(0)
          .toUpperCase() +
        url.hostname
          .replace(/^www\./, "")
          .split(".")[0]
          .slice(1);

      // Update form data with generated content
      setFormData({
        brandName: brandName,
        brandDescription: data.brand_description,
        problems: data.target_problems.length > 0 ? data.target_problems : [""],
        offerings: data.offerings || [{ title: "", description: "" }],
      });

      setPhase("details");
    } catch (error) {
      console.error("Failed to generate brand info:", error);
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Failed to analyze website. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSkipWebsite = () => {
    // Skip website analysis and go directly to manual form
    setWebsiteUrl("");
    setFormData({
      brandName: "",
      brandDescription: "",
      problems: [""],
      offerings: [],
    });
    setPhase("details");
  };

  const handleInputChange = (
    field: string,
    value: string | string[] | BrandOffering[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProblemChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      problems: prev.problems.map((problem, i) =>
        i === index ? value : problem
      ),
    }));
  };

  const addProblem = () => {
    setFormData((prev) => ({
      ...prev,
      problems: [...prev.problems, ""],
    }));
  };

  const removeProblem = (index: number) => {
    if (formData.problems.length > 1) {
      setFormData((prev) => ({
        ...prev,
        problems: prev.problems.filter((_, i) => i !== index),
      }));
    }
  };

  const handleOfferingChange = (
    index: number,
    field: keyof BrandOffering,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      offerings: prev.offerings.map((offering, i) =>
        i === index ? { ...offering, [field]: value } : offering
      ),
    }));
  };

  const addOffering = () => {
    setFormData((prev) => ({
      ...prev,
      offerings: [...prev.offerings, { title: "", description: "" }],
    }));
  };

  const removeOffering = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      offerings: prev.offerings.filter((_, i) => i !== index),
    }));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call the onboard API with the new structure
      const response = await fetch("/api/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brandName: formData.brandName,
          website: websiteUrl || null,
          brandDescription: formData.brandDescription,
          problems: formData.problems.filter((p) => p.trim()),
          offerings: formData.offerings.filter(
            (o) => o.title.trim() && o.description.trim()
          ),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create brand profile");
      }

      const result = await response.json();

      // Handle the new response structure
      if (!result.success) {
        throw new Error(result.message || "Failed to create brand profile");
      }

      console.log("Brand profile created successfully:", result.data);

      // Set brand_id cookie for subsequent requests
      if (result.data?.brand_id) {
        document.cookie = `brand_id=${result.data.brand_id}; path=/; max-age=${
          60 * 60 * 24 * 30
        }`; // 30 days
      }

      // Clear onboarding data from localStorage since we're done
      localStorage.removeItem("onboardingData");

      // Redirect to dashboard after successful onboarding
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to submit onboarding data:", error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : "Failed to submit data"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.brandName.trim() &&
    formData.brandDescription.trim() &&
    formData.problems.some((p) => p.trim());

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background with Liquid Glass Effect */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3), transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.2), transparent 50%),
            linear-gradient(135deg, #0F0F23 0%, #1A0B2E 25%, #2D1B3D 50%, #1E293B 75%, #0F172A 100%)
          `,
        }}
      />

      {/* Floating Glass Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-30 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.1) 70%, transparent 100%)",
            filter: "blur(40px)",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-40 right-32 w-96 h-96 rounded-full opacity-25 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.1) 70%, transparent 100%)",
            filter: "blur(50px)",
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.05) 70%, transparent 100%)",
            filter: "blur(30px)",
            animation: "float 10s ease-in-out infinite",
          }}
        />
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translateY(10px) rotate(240deg);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.3),
              0 0 40px rgba(34, 197, 94, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.5),
              0 0 60px rgba(34, 197, 94, 0.4);
          }
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        .glass-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(30px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .glass-input {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        .glass-input:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(168, 85, 247, 0.5);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
        }
        .glass-button {
          background: linear-gradient(
            135deg,
            rgba(168, 85, 247, 0.8),
            rgba(34, 197, 94, 0.8)
          );
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }
        .glass-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 2s infinite;
        }
      `}</style>

      <div className="glass-header relative z-10">
        <OnboardingHeader session={session} />
      </div>

      {/* Loading Overlay */}
      {(isSubmitting || isGenerating) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass-card rounded-3xl p-12 max-w-md mx-auto text-center">
            {/* Animated Spinner */}
            <div className="mb-8 flex justify-center">
              <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            </div>

            {/* Loading Message */}
            <p className="text-2xl font-heading font-bold text-white mb-4">
              {loadingMessage}
            </p>

            <p className="text-white/80 font-body">
              This usually takes about a minute...
            </p>
          </div>
        </div>
      )}

      <main className="container mx-auto px-6 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {phase === "website" ? (
            <>
              <div className="text-center mb-12">
                <h1 className="font-heading text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                  Welcome to{" "}
                  <span className="bg-gradient-to-r from-purple-400 via-green-400 to-white bg-clip-text text-transparent">
                    PlumSprout
                  </span>
                  ! 🚀
                </h1>
                <p className="font-body text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                  Let's understand your brand better. Start by entering your
                  website URL.
                </p>
              </div>

              <form
                onSubmit={handleWebsiteSubmit}
                className="glass-card rounded-3xl p-12 shadow-2xl"
              >
                <div className="mb-8">
                  <label
                    htmlFor="website"
                    className="block text-white font-heading text-xl font-bold mb-4 tracking-wide text-center"
                  >
                    Enter your website URL 🌐
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://your-awesome-site.com"
                    className="w-full px-8 py-6 glass-input rounded-2xl text-white placeholder-white/60 focus:outline-none font-body text-xl text-center"
                    required
                  />
                  {generationError && (
                    <p className="text-red-300 text-sm mt-2 text-center">
                      {generationError}
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={!websiteUrl.trim() || isGenerating}
                    className="px-16 py-6 glass-button disabled:opacity-50 disabled:cursor-not-allowed text-white font-heading font-bold text-2xl rounded-2xl transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                    style={{
                      animation: websiteUrl.trim()
                        ? "glow 3s ease-in-out infinite"
                        : "none",
                    }}
                  >
                    {isGenerating ? "Analyzing..." : "Analyze My Brand 🔍"}
                  </button>

                  <p className="mt-6">
                    <button
                      type="button"
                      onClick={handleSkipWebsite}
                      className="text-white/70 hover:text-white underline text-lg font-body transition-colors"
                    >
                      I don't have a website yet →
                    </button>
                  </p>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-12">
                <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                  Perfect! Let's refine your{" "}
                  <span className="bg-gradient-to-r from-purple-400 via-green-400 to-white bg-clip-text text-transparent">
                    brand profile
                  </span>{" "}
                  ✨
                </h1>
              </div>

              <form
                onSubmit={handleFinalSubmit}
                className="glass-card rounded-3xl p-8 shadow-2xl"
              >
                {/* Brand Name */}
                <div className="mb-8">
                  <label
                    htmlFor="brandName"
                    className="block text-white font-heading text-lg font-bold mb-3 tracking-wide"
                  >
                    Brand Name ✨
                  </label>
                  <input
                    type="text"
                    id="brandName"
                    value={formData.brandName}
                    onChange={(e) =>
                      handleInputChange("brandName", e.target.value)
                    }
                    placeholder="e.g., TechFlow Solutions"
                    className="w-full px-6 py-4 glass-input rounded-xl text-white placeholder-white/60 focus:outline-none font-body"
                    required
                  />
                </div>

                {/* Brand Description */}
                <div className="mb-8">
                  <label
                    htmlFor="brandDescription"
                    className="block text-white font-heading text-lg font-bold mb-3 tracking-wide"
                  >
                    Brand Description 📝
                  </label>
                  <textarea
                    id="brandDescription"
                    value={formData.brandDescription}
                    onChange={(e) =>
                      handleInputChange("brandDescription", e.target.value)
                    }
                    placeholder="What does your brand do? What makes you special?"
                    rows={4}
                    className="w-full px-6 py-4 glass-input rounded-xl text-white placeholder-white/60 focus:outline-none font-body resize-none"
                  />
                </div>

                {/* Target Problems */}
                <div className="mb-8">
                  <label className="block text-white font-heading text-lg font-bold mb-6 tracking-wide">
                    Problems You Solve 🎯
                  </label>
                  <div className="space-y-4">
                    {formData.problems.map((problem, index) => (
                      <div key={index} className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={problem}
                            onChange={(e) =>
                              handleProblemChange(index, e.target.value)
                            }
                            placeholder={`Problem #${index + 1}`}
                            className="flex-1 px-6 py-4 glass-input rounded-xl text-white placeholder-white/60 focus:outline-none font-body"
                          />
                          {formData.problems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeProblem(index)}
                              className="px-4 py-2 text-red-300 hover:text-red-200 transition-colors font-medium text-lg"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <SecondaryButton type="button" onClick={addProblem}>
                      + Add Another Problem
                    </SecondaryButton>
                  </div>
                </div>

                {/* Offerings */}
                <div className="mb-8">
                  <label className="block text-white font-heading text-lg font-bold mb-3 tracking-wide">
                    Your Offerings 💼
                  </label>
                  <p className="text-white/60 text-sm font-body mb-6">
                    Have products or services? List them here (optional)
                  </p>

                  {formData.offerings.length > 0 ? (
                    <div className="space-y-6">
                      {formData.offerings.map((offering, index) => (
                        <div key={index} className="glass-card rounded-2xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-heading font-bold tracking-wide">
                              Offering #{index + 1}
                            </h3>
                            <button
                              type="button"
                              onClick={() => removeOffering(index)}
                              className="text-red-300 hover:text-red-200 transition-colors font-medium"
                            >
                              ✕ Remove
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <input
                                type="text"
                                value={offering.title}
                                onChange={(e) =>
                                  handleOfferingChange(
                                    index,
                                    "title",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., AI-Powered Analytics"
                                className="w-full px-6 py-4 glass-input rounded-xl text-white placeholder-white/60 focus:outline-none font-body"
                              />
                            </div>
                            <div>
                              <textarea
                                value={offering.description}
                                onChange={(e) =>
                                  handleOfferingChange(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="Describe this offering..."
                                rows={3}
                                className="w-full px-6 py-4 glass-input rounded-xl text-white placeholder-white/60 focus:outline-none font-body resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4">
                    <SecondaryButton type="button" onClick={addOffering}>
                      {formData.offerings.length === 0
                        ? "+ Add Offering"
                        : "+ Add Another Offering"}
                    </SecondaryButton>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center pt-6">
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="px-12 py-4 glass-button disabled:opacity-50 disabled:cursor-not-allowed text-white font-heading font-bold text-lg rounded-2xl transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                    style={{
                      animation: isFormValid
                        ? "glow 3s ease-in-out infinite"
                        : "none",
                    }}
                  >
                    {isSubmitting
                      ? "Setting up your account..."
                      : "Let's Get Started! 🎉"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          {/* Animated Background */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: `
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3), transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.2), transparent 50%),
                linear-gradient(135deg, #0F0F23 0%, #1A0B2E 25%, #2D1B3D 50%, #1E293B 75%, #0F172A 100%)
              `,
            }}
          />
          <div className="text-white text-xl relative z-10">Loading...</div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
