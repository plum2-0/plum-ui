"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { useOnboardingState } from "@/hooks/useOnboardingState";

interface UseCase {
  title: string;
  description: string;
}

function OnboardingContent() {
  const { data: session, status } = useSession();
  // Auto-redirect users to the correct onboarding step or dashboard if complete
  useOnboardingState(true);
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
    if (!session?.user) {
      redirect("/auth/signin");
    }

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
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700">
      <OnboardingHeader session={session} />

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 max-w-md mx-auto text-center">
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

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-6">
              Welcome to Plum! 🚀
            </h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Let&apos;s get to know your brand so we can help you monitor
              conversations and engage with your community more effectively.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl"
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
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
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
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all resize-none"
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
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
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
                    className="bg-white/10 rounded-2xl p-6 border border-white/20"
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
                          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
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
                          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all resize-none"
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
                        className="px-6 py-3 bg-gradient-to-r from-pink-400/80 to-purple-500/80 hover:from-pink-500/90 hover:to-purple-600/90 text-white rounded-xl transition-all font-medium transform hover:scale-105 shadow-lg"
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
                className="px-12 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold text-lg rounded-2xl transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
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
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
