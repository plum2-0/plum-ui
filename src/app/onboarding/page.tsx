"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { useRedirectToDashboard } from "@/hooks/useRedirectToDashboard";

interface UseCase {
  title: string;
  description: string;
}

function OnboardingContent() {
  const { data: session, status } = useSession();
  // Auto-redirect users to the correct onboarding step or dashboard if complete
  useOnboardingState(true);
  // If user already has a brand, skip onboarding entirely
  useRedirectToDashboard();
  const router = useRouter();
  const [formData, setFormData] = useState({
    brandName: "",
    description: "",
    website: "",
    useCases: [{ title: "", description: "" }] as UseCase[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  useEffect(() => {
    if (isSubmitting) {
      const messages = [
        "🚀 Setting up your brand profile...",
        "🔍 Analyzing your brand information...",
        "🎯 Configuring your monitoring preferences...",
        "✨ Preparing your dashboard...",
        "🎉 Almost there! Finalizing setup...",
      ] as const;

      let messageIndex = 0;
      setLoadingMessage(messages[0]);

      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingMessage(messages[messageIndex]);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isSubmitting]);

  useEffect(() => {
    if (status === "loading") return;

    // Load existing data from localStorage
    const savedData = localStorage.getItem("onboardingData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData((prev) => ({
          ...prev,
          ...parsedData,
        }));
      } catch (error) {
        console.error("Failed to parse saved onboarding data:", error);
      }
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Guard handles redirect; avoid flashing content when unauthenticated
  if (!session?.user) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUseCaseChange = (
    index: number,
    field: keyof UseCase,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      useCases: prev.useCases.map((useCase, i) =>
        i === index ? { ...useCase, [field]: value } : useCase
      ),
    }));
  };

  const addUseCase = () => {
    setFormData((prev) => ({
      ...prev,
      useCases: [...prev.useCases, { title: "", description: "" }],
    }));
  };

  const removeUseCase = (index: number) => {
    // Always keep at least one use case, and don't allow removing the first one
    if (formData.useCases.length > 1 && index > 0) {
      setFormData((prev) => ({
        ...prev,
        useCases: prev.useCases.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save to localStorage
      localStorage.setItem("onboardingData", JSON.stringify(formData));

      // Call the onboard API
      const response = await fetch("/api/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brandName: formData.brandName,
          description: formData.description,
          website: formData.website,
          useCases: formData.useCases.filter(
            (uc) => uc.title.trim() && uc.description.trim()
          ),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create brand profile");
      }

      const result = await response.json();
      console.log("Brand profile created successfully:", result);

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
    formData.description.trim() &&
    formData.website.trim() &&
    formData.useCases.some((uc) => uc.title.trim() && uc.description.trim());

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background with Liquid Glass Effect */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3), transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.2), transparent 50%),
            linear-gradient(135deg, #0F0F23 0%, #1A0B2E 25%, #2D1B3D 50%, #1E293B 75%, #0F172A 100%)
          `
        }}
      />
      
      {/* Floating Glass Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-30 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.1) 70%, transparent 100%)',
            filter: 'blur(40px)',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute top-40 right-32 w-96 h-96 rounded-full opacity-25 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.1) 70%, transparent 100%)',
            filter: 'blur(50px)',
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />
        <div 
          className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.05) 70%, transparent 100%)',
            filter: 'blur(30px)',
            animation: 'float 10s ease-in-out infinite'
          }}
        />
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(34, 197, 94, 0.2); }
          50% { box-shadow: 0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(34, 197, 94, 0.4); }
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        .glass-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(30px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .glass-button {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(34, 197, 94, 0.8));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }
        .glass-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 2s infinite;
        }
      `}</style>

      <div className="relative z-10 w-full">
        <OnboardingHeader session={session} />

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass-card rounded-3xl p-12 max-w-md mx-auto text-center">
            {/* Spinner */}
            <div className="mb-8 flex justify-center">
              <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
            </div>

            {/* Loading Message */}
            <p className="text-2xl font-semibold text-white mb-4">
              {loadingMessage}
            </p>

            <p className="text-white/80">
              This usually takes about a minute...
            </p>
          </div>
        </div>
      )}

      <main className="container mx-auto px-6 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-2xl">
              Welcome to <span className="bg-gradient-to-r from-purple-400 via-green-400 to-white bg-clip-text text-transparent animate-pulse">Plum!</span> 🚀
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Let&apos;s get to know your brand so we can help you monitor
              conversations and engage with your community more effectively.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="glass-card rounded-3xl p-8"
          >
            {/* Brand Name */}
            <div className="mb-8">
              <label
                htmlFor="brandName"
                className="block text-white text-lg font-semibold mb-3"
              >
                What&apos;s your brand name? ✨
              </label>
              <input
                type="text"
                id="brandName"
                value={formData.brandName}
                onChange={(e) => handleInputChange("brandName", e.target.value)}
                placeholder="e.g., TechFlow Solutions"
                className="w-full px-4 py-3 glass-card rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-8">
              <label
                htmlFor="description"
                className="block text-white text-lg font-semibold mb-3"
              >
                Tell us about your brand 📝
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="What does your brand do? What makes you special?"
                rows={4}
                className="w-full px-4 py-3 glass-card rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Website */}
            <div className="mb-8">
              <label
                htmlFor="website"
                className="block text-white text-lg font-semibold mb-3"
              >
                What&apos;s your website? 🌐
              </label>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://your-awesome-site.com"
                className="w-full px-4 py-3 glass-card rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Use Cases */}
            <div className="mb-8">
              <label className="block text-white text-lg font-semibold mb-6">
                How can we help you engage? 💬
              </label>

              <div className="space-y-6">
                {formData.useCases.map((useCase, index) => (
                  <div
                    key={index}
                    className="glass-card rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold">
                        {index === 0
                          ? "Primary Use Case"
                          : `Use Case #${index + 1}`}
                      </h3>
                      {formData.useCases.length > 1 && index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeUseCase(index)}
                          className="text-red-300 hover:text-red-200 transition-colors"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <input
                          type="text"
                          value={useCase.title}
                          onChange={(e) =>
                            handleUseCaseChange(index, "title", e.target.value)
                          }
                          placeholder="e.g., API Integration Support"
                          className="w-full px-4 py-3 glass-card rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <textarea
                          value={useCase.description}
                          onChange={(e) =>
                            handleUseCaseChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Describe how you want to help with this topic..."
                          rows={3}
                          className="w-full px-4 py-3 glass-card rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show Add Use Case button only after first use case has content */}
              {formData.useCases[0] &&
                (formData.useCases[0].title.trim() ||
                  formData.useCases[0].description.trim()) && (
                  <div className="mt-6 text-center">
                    <div className="mb-4">
                      <p className="text-purple-100 text-sm mb-3">
                        Add as many use cases as you want!
                      </p>
                      <button
                        type="button"
                        onClick={addUseCase}
                        className="px-6 py-3 glass-button text-white rounded-xl transition-all font-medium transform hover:scale-105"
                      >
                        ✨ Add Another Use Case
                      </button>
                    </div>
                  </div>
                )}
            </div>

            {/* Submit Button */}
            <div className="text-center pt-6">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="px-12 py-4 glass-button disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-2xl transition-all transform hover:scale-105 disabled:hover:scale-100"
                style={{ animation: !isSubmitting && isFormValid ? 'glow 3s ease-in-out infinite' : 'none' }}
              >
                {isSubmitting
                  ? "Setting up your account..."
                  : "Let's Get Started! 🎉"}
              </button>
            </div>
          </form>
        </div>
      </main>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
