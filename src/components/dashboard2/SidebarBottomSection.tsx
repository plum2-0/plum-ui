"use client";

import { useState, useRef, useEffect } from "react";
import GlassPanel from "@/components/ui/GlassPanel";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import InviteTeammateModal from "./InviteTeammateModal";

export default function SidebarBottomSection() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    // Clear all application-specific data before signing out
    
    // Clear localStorage
    if (typeof window !== "undefined") {
      // Clear any onboarding data
      localStorage.removeItem("onboardingData");
      
      // Clear all localStorage items with our app prefix (if any)
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    // Clear sessionStorage
    if (typeof window !== "undefined") {
      // Clear Reddit auth cache
      sessionStorage.removeItem("reddit_auth_cache");
      
      // Clear onboarding redirect tracking
      sessionStorage.removeItem("lastOnboardingRedirect");
      sessionStorage.removeItem("lastOnboardingRedirectTime");
      
      // Clear any draft data (agent reply drafts)
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith("agent_draft_") || key.startsWith("draft_"))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
      
      // Clear all sessionStorage
      sessionStorage.clear();
    }
    
    // Clear cookies (brand_id, project_id, etc.)
    if (typeof document !== "undefined") {
      // Get all cookies
      const cookies = document.cookie.split(";");
      
      // Clear each cookie by setting it with an expired date
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        // Clear cookie for current path
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        
        // Also try to clear for current domain and parent domains
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      });
    }
    
    // Sign out from NextAuth
    await signOut({ callbackUrl: "/" });
  };

  const handleSettingsClick = () => {
    router.push("/dashboard/settings");
    setIsMenuOpen(false);
  };

  const handleInviteClick = () => {
    setIsInviteOpen(true);
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="px-4 py-4 border-t border-white/10 relative" ref={menuRef}>
      {/* User Profile Section - Clickable */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors group"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{
            background:
              "linear-gradient(135deg, rgba(168, 85, 247, 0.6), rgba(34, 197, 94, 0.6))",
          }}
        >
          {session?.user?.name?.charAt(0)?.toUpperCase() ||
            session?.user?.email?.charAt(0)?.toUpperCase() ||
            "U"}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-white/80 font-body text-sm truncate">
            {session?.user?.name ||
              session?.user?.email?.split("@")[0] ||
              "User"}
          </p>
          <p className="text-white/50 font-body text-xs truncate">
            {session?.user?.email}
          </p>
        </div>
        {/* Dropdown Indicator */}
        <svg
          className={`w-4 h-4 text-white/50 transition-transform duration-200 ${
            isMenuOpen ? "rotate-180" : ""
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
      </button>

      {/* Popover Menu */}
      {isMenuOpen && (
        <GlassPanel
          className="absolute bottom-full left-4 right-4 mb-2 rounded-xl overflow-hidden shadow-2xl"
          variant="medium"
          style={{
            background: "rgba(30, 30, 40, 0.95)",
            boxShadow:
              "0 -8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="py-1">
            {/* Settings Option */}
            <button
              onClick={handleSettingsClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm font-body"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Settings</span>
            </button>

            {/* Invite Teammate Option */}
            <button
              onClick={handleInviteClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm font-body"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              <span>Invite Teammate</span>
            </button>

            {/* Divider */}
            <div className="my-1 border-t border-white/10"></div>

            {/* Sign Out Option */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-sm font-body"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </GlassPanel>
      )}

      {/* Invite Modal */}
      <InviteTeammateModal
        brandId={session?.user?.brandId || null}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  );
}
