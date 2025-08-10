import { useState } from "react";
import Image from "next/image";
import { Brand } from "@/types/brand";
import RedditConfig from "./RedditConfig";
import LinkedInConfig from "./LinkedInConfig";
import FacebookConfig from "./FacebookConfig";

interface SocialMediaManagerProps {
  brand: Brand | null;
  onUpdate: (brand: Brand) => void;
}

export default function SocialMediaManager({
  brand,
  onUpdate,
}: SocialMediaManagerProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "reddit"
  );

  const isRedditConnected = brand?.source?.reddit?.oauth_token ? true : false;
  const redditUsername = brand?.source?.reddit?.username || null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-semibold text-white mb-4">
          Connected Accounts
        </h2>
        <p className="text-white/60 font-body text-sm">
          Manage your social media connections and configurations
        </p>
      </div>

      <div className="space-y-4">
        {/* Reddit Card */}
        <div className="glass-inner rounded-lg overflow-hidden">
          <button
            onClick={() =>
              setExpandedSection(expandedSection === "reddit" ? null : "reddit")
            }
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Image src="/reddit.svg" alt="Reddit" width={24} height={24} />
              </div>
              <div className="text-left">
                <h3 className="text-white font-body font-medium">Reddit</h3>
                {isRedditConnected ? (
                  <p className="text-green-400 text-sm font-body">
                    Connected as u/{redditUsername}
                  </p>
                ) : (
                  <p className="text-white/40 text-sm font-body">
                    Not connected
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isRedditConnected && (
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-body">
                  Connected
                </span>
              )}
              <svg
                className={`w-5 h-5 text-white/60 transition-transform ${
                  expandedSection === "reddit" ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>
          {expandedSection === "reddit" && (
            <div className="px-6 pb-6 border-t border-white/10">
              <RedditConfig brand={brand} onUpdate={onUpdate} />
            </div>
          )}
        </div>

        {/* LinkedIn Card */}
        <div className="glass-inner rounded-lg overflow-hidden opacity-60">
          <button
            disabled
            className="w-full px-6 py-4 flex items-center justify-between cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 text-xl">🔗</span>
              </div>
              <div className="text-left">
                <h3 className="text-white font-body font-medium">LinkedIn</h3>
                <p className="text-white/40 text-sm font-body">Coming soon</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/40 text-xs font-body">
                Coming Soon
              </span>
            </div>
          </button>
          {expandedSection === "linkedin" && (
            <div className="px-6 pb-6 border-t border-white/10">
              <LinkedInConfig />
            </div>
          )}
        </div>

        {/* Facebook Card */}
        <div className="glass-inner rounded-lg overflow-hidden opacity-60">
          <button
            disabled
            className="w-full px-6 py-4 flex items-center justify-between cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <span className="text-blue-500 text-xl">📘</span>
              </div>
              <div className="text-left">
                <h3 className="text-white font-body font-medium">Facebook</h3>
                <p className="text-white/40 text-sm font-body">Coming soon</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/40 text-xs font-body">
                Coming Soon
              </span>
            </div>
          </button>
          {expandedSection === "facebook" && (
            <div className="px-6 pb-6 border-t border-white/10">
              <FacebookConfig />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .glass-inner {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
