import { useRouter, usePathname } from "next/navigation";
import MobileSidebarWrapper from "@/components/shared/MobileSidebarWrapper";

export default function SettingsSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      id: "brand",
      label: "Brand",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      href: "/dashboard/settings",
    },
    {
      id: "social",
      label: "Social Media",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
          />
        </svg>
      ),
      href: "/dashboard/settings/social",
      disabled: false,
    },
    {
      id: "team",
      label: "Team",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      href: "#",
      disabled: true,
      comingSoon: true,
    },
    {
      id: "billing",
      label: "Billing",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      href: "#",
      disabled: true,
      comingSoon: true,
    },
  ];

  const handleNavigation = (href: string, disabled: boolean) => {
    if (disabled || href === "#") return;
    router.push(href);
  };

  const sidebarContent = (
    <div className="w-full md:w-64 glass-sidebar h-full border-r border-white/10">
      <div className="p-6">
        <div className="mb-6 pb-6 border-b border-white/10">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all font-body text-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to Dashboard</span>
          </button>
        </div>

        <h2 className="text-lg font-heading font-semibold text-white mb-6">
          Settings
        </h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.id === "brand" && pathname === "/dashboard/settings");

            return (
              <button
                key={item.id}
                onClick={() =>
                  handleNavigation(item.href, item.disabled || false)
                }
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-body text-sm ${
                  isActive
                    ? "glass-card text-white"
                    : item.disabled
                    ? "text-white/30 cursor-not-allowed"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                {item.comingSoon && (
                  <span className="text-xs text-white/40 bg-white/10 px-2 py-1 rounded">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <style jsx>{`
        .glass-sidebar {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );

  return <MobileSidebarWrapper>{sidebarContent}</MobileSidebarWrapper>;
}
