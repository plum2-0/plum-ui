import { useState } from "react";
import { Brand } from "@/types/brand";

interface BrandSettingsProps {
  brand: Brand | null;
  onUpdate: (brand: Brand) => void;
}

export default function BrandSettings({ brand, onUpdate }: BrandSettingsProps) {
  const [formData, setFormData] = useState({
    name: brand?.name || "",
    website: brand?.website || "",
    description: brand?.detail || "",
    keywords: "",
    voice: "professional",
  });
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && formData.keywords.trim()) {
      e.preventDefault();
      if (!keywords.includes(formData.keywords.trim())) {
        setKeywords([...keywords, formData.keywords.trim()]);
        setFormData(prev => ({ ...prev, keywords: "" }));
      }
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/brand/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          keywords: keywords,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update brand information");
      }

      const result = await response.json();
      onUpdate(result.brand);
      setMessage({ type: "success", text: "Brand information updated successfully!" });
    } catch (error) {
      console.error("Error updating brand:", error);
      setMessage({ type: "error", text: "Failed to update brand information" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-semibold text-white mb-4">
          Brand Information
        </h2>
        <p className="text-white/60 font-body text-sm">
          Update your brand details and identity
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-white/80 font-body text-sm mb-2">
            Brand Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all font-body"
            placeholder="Enter your brand name"
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-white/80 font-body text-sm mb-2">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all font-body"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-white/80 font-body text-sm mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all font-body resize-none"
            placeholder="Describe your brand and what makes it unique..."
          />
        </div>

        <div>
          <label htmlFor="keywords" className="block text-white/80 font-body text-sm mb-2">
            Target Keywords
          </label>
          <input
            type="text"
            id="keywords"
            name="keywords"
            value={formData.keywords}
            onChange={handleInputChange}
            onKeyDown={handleAddKeyword}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all font-body"
            placeholder="Press Enter to add keywords"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm font-body"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="voice" className="block text-white/80 font-body text-sm mb-2">
            Brand Voice/Tone
          </label>
          <select
            id="voice"
            name="voice"
            value={formData.voice}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all font-body"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
            <option value="authoritative">Authoritative</option>
            <option value="playful">Playful</option>
          </select>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
        } font-body text-sm`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 rounded-lg glass-button text-white font-body font-medium hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <style jsx>{`
        .glass-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </form>
  );
}