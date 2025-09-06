"use client";

import { Suspense, useEffect, useState } from "react";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { useMultiBrandOnboardingRedirects } from "@/hooks/useRedirects";
import { useUserBrands } from "@/hooks/api/useBrandQuery";

interface BrandOffering {
  title: string;
  description: string;
}

interface BrandGenerationResponse {
  brand_description: string;
  target_problems: string[];
  brand_offerings: BrandOffering[];
  target_keywords: string[];
  target_demographics: string[];
}

function OnboardingContent() {
  // Use multi-brand auth hook - redirects unauthenticated users to signin
  // but allows users with existing brands to create new ones
  const { isLoading, isAuthenticated, user, hasBrand } =
    useMultiBrandOnboardingRedirects();

  // Get existing brands for users who already have them
  const { userBrands } = useUserBrands();

  const [phase, setPhase] = useState<"website" | "details">("website");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [formData, setFormData] = useState({
    brandName: "",
    brandDescription: "",
    problems: "",
    offerings: [] as BrandOffering[],
    keywords: [""],
    demographics: [""],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Maximum number of prospects allowed
  const MAX_PROSPECTS = 3;

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

  if (isLoading) {
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

  // Hook handles redirect; avoid flashing content when loading
  if (!isAuthenticated || !user) return null;

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

    // Prepend https:// if no protocol is specified
    let normalizedUrl = websiteUrl.trim();
    if (normalizedUrl && !normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    if (!validateUrl(normalizedUrl)) {
      setGenerationError("Please enter a valid URL");
      return;
    }

    setIsGenerating(true);
    setGenerationError("");

    try {
      // Call the brand generation API
      const response = await fetch(
        `/api/brand/generate/web?web_url=${encodeURIComponent(normalizedUrl)}`,
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
      const url = new URL(normalizedUrl);
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
        problems:
          data.target_problems.length > 0
            ? data.target_problems.join("\n")
            : "",
        offerings: data.brand_offerings || [{ title: "", description: "" }],
        keywords:
          data.target_keywords?.length > 0 ? data.target_keywords : [""],
        demographics:
          data.target_demographics?.length > 0
            ? data.target_demographics
            : [""],
      });

      // Update the websiteUrl with the normalized version
      setWebsiteUrl(normalizedUrl);
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
      problems: "",
      offerings: [],
      keywords: [""],
      demographics: [""],
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

  const handleKeywordChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.map((keyword, i) =>
        i === index ? value : keyword
      ),
    }));
  };

  const addKeyword = () => {
    setFormData((prev) => ({
      ...prev,
      keywords: [...prev.keywords, ""],
    }));
  };

  const removeKeyword = (index: number) => {
    if (formData.keywords.length > 1) {
      setFormData((prev) => ({
        ...prev,
        keywords: prev.keywords.filter((_, i) => i !== index),
      }));
    }
  };

  const handleDemographicChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      demographics: prev.demographics.map((demographic, i) =>
        i === index ? value : demographic
      ),
    }));
  };

  const addDemographic = () => {
    setFormData((prev) => ({
      ...prev,
      demographics: [...prev.demographics, ""],
    }));
  };

  const removeDemographic = (index: number) => {
    if (formData.demographics.length > 1) {
      setFormData((prev) => ({
        ...prev,
        demographics: prev.demographics.filter((_, i) => i !== index),
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
      // Ensure user is authenticated
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Parse and validate problems (prospects)
      const problems = formData.problems
        .split("\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      // Check prospect limit
      if (problems.length > MAX_PROSPECTS) {
        alert(
          `Error: You can only create ${MAX_PROSPECTS} prospects at a time. You have entered ${problems.length} problems. Please reduce to ${MAX_PROSPECTS} problems.`
        );
        setIsSubmitting(false);
        return;
      }

      // Call the onboard API with the correct structure matching BrandOnboardingRequest
      const response = await fetch("/api/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand_name: formData.brandName,
          brand_website: websiteUrl || null,
          brand_description: formData.brandDescription,
          problems: problems,
          offerings: formData.offerings.filter(
            (o) => o.title.trim() && o.description.trim()
          ),
          keywords: formData.keywords.filter((k) => k.trim()),
          user_id: user.id,
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

        // Set the new brand as active in localStorage
        localStorage.setItem("activeBrandId", result.data.brand_id);
      }

      // Force a hard redirect to dashboard which will refresh the session
      window.location.href = "/dashboard/discover";
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
    formData.problems.trim();

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
        {user && <OnboardingHeader session={{ user }} />}
      </div>

      {/* Existing Brands Notice */}
      {userBrands.length > 0 && (
        <div className="relative z-10 container mx-auto px-6 pt-6">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-2xl p-6 border border-blue-400/30">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-heading font-bold text-lg mb-2">
                    Creating Additional Brand
                  </h3>
                  <p className="text-white/80 font-body mb-4">
                    You already have {userBrands.length} brand
                    {userBrands.length !== 1 ? "s" : ""}:{" "}
                    <span className="font-medium text-white">
                      {userBrands.map((brand) => brand.name).join(", ")}
                    </span>
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        (window.location.href = "/dashboard/discover")
                      }
                      className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-blue-300 hover:text-blue-200 transition-all text-sm font-medium"
                    >
                      ← Back to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  {userBrands.length > 0 ? (
                    <>
                      <span className="bg-gradient-to-r from-purple-400 via-green-400 to-white bg-clip-text text-transparent">
                        Add Another Brand
                      </span>
                      ! ✨
                    </>
                  ) : (
                    <>
                      <span className="bg-gradient-to-r from-purple-400 via-green-400 to-white bg-clip-text text-transparent">
                        Let's understand your brand
                      </span>
                      ! 🚀
                    </>
                  )}
                </h1>
                <p className="font-body text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                  {userBrands.length > 0
                    ? "Let's set up your additional brand. Start by entering your website URL."
                    : "Start by entering your website URL."}
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
                    type="text"
                    id="website"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="your-awesome-site.com"
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
                  <label
                    htmlFor="problems"
                    className="block text-white font-heading text-lg font-bold mb-3 tracking-wide"
                  >
                    Problems You Solve 🎯
                  </label>
                  <p className="text-white/60 text-sm font-body mb-4">
                    Enter the problems your brand solves (one per line, maximum{" "}
                    {MAX_PROSPECTS} problems)
                  </p>
                  {(() => {
                    const problemCount = formData.problems
                      .split("\n")
                      .filter((p) => p.trim().length > 0).length;
                    return problemCount > MAX_PROSPECTS ? (
                      <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                        <p className="text-red-400 text-sm font-medium">
                          ⚠️ You have entered {problemCount} problems but only{" "}
                          {MAX_PROSPECTS} are allowed. Please reduce to{" "}
                          {MAX_PROSPECTS} problems to continue.
                        </p>
                      </div>
                    ) : null;
                  })()}
                  <textarea
                    id="problems"
                    value={formData.problems}
                    onChange={(e) =>
                      handleInputChange("problems", e.target.value)
                    }
                    placeholder="Example:
Small businesses struggle with social media management
Marketing teams need better analytics tools
Entrepreneurs lack time for content creation"
                    rows={5}
                    className="w-full px-6 py-4 glass-input rounded-xl text-white placeholder-white/60 focus:outline-none font-body resize-none"
                  />
                </div>

                {/* Target Keywords */}
                <div className="mb-8">
                  <label className="block text-white font-heading text-lg font-bold mb-6 tracking-wide">
                    Target Keywords 🔍
                  </label>
                  <div className="space-y-4">
                    {formData.keywords.map((keyword, index) => (
                      <div key={index} className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={keyword}
                            onChange={(e) =>
                              handleKeywordChange(index, e.target.value)
                            }
                            placeholder={`Keyword #${index + 1}`}
                            className="flex-1 px-6 py-4 glass-input rounded-xl text-white placeholder-white/60 focus:outline-none font-body"
                          />
                          {formData.keywords.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeKeyword(index)}
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
                    <SecondaryButton type="button" onClick={addKeyword}>
                      + Add Another Keyword
                    </SecondaryButton>
                  </div>
                </div>

                {/* Target Demographics */}
                <div className="mb-8">
                  <label className="block text-white font-heading text-lg font-bold mb-6 tracking-wide">
                    Target Demographics 👥
                  </label>
                  <div className="space-y-4">
                    {formData.demographics.map((demographic, index) => (
                      <div key={index} className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={demographic}
                            onChange={(e) =>
                              handleDemographicChange(index, e.target.value)
                            }
                            placeholder={`Demographic #${index + 1}`}
                            className="flex-1 px-6 py-4 glass-input rounded-xl text-white placeholder-white/60 focus:outline-none font-body"
                          />
                          {formData.demographics.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDemographic(index)}
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
                    <SecondaryButton type="button" onClick={addDemographic}>
                      + Add Another Demographic
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
                      : "Let's Find Customers! 🎉"}
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
