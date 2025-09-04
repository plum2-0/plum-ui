"use client";

import SettingsSidebar from "@/components/settings/SettingsSidebar";
import { useProtectedPageLoading } from "@/hooks/useRedirects";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simple loading check for protected pages
  const { isLoading } = useProtectedPageLoading();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-white text-xl font-body">
          Loading Settings...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <SettingsSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
