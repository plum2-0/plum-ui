"use client";

import { useState, useRef, useEffect } from "react";
import { useUserBrands } from "@/hooks/api/useBrandQuery";
import GlassPanel from "@/components/ui/GlassPanel";
import { useRouter } from "next/navigation";

export default function BrandSwitcher() {
  const router = useRouter();
  const { userBrands, activeBrandId, switchActiveBrand, isLoading, error } =
    useUserBrands();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get active brand info
  const activeBrand = userBrands.find((brand) => brand.id === activeBrandId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Show loading state with mint theme
  if (isLoading) {
    return (
      <div className="relative mb-4">
        <div
          className="relative p-1 rounded-xl animate-pulse"
          style={{
            background:
              "linear-gradient(145deg, rgba(100, 116, 139, 0.08), rgba(71, 85, 105, 0.12))",
            border: "1px solid rgba(100, 116, 139, 0.15)",
            boxShadow:
              "inset 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 -1px 2px rgba(100, 116, 139, 0.08)",
          }}
        >
          <div
            className="rounded-lg p-0.5"
            style={{
              background:
                "linear-gradient(145deg, rgba(0, 0, 0, 0.2), rgba(100, 116, 139, 0.04))",
              boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div className="w-full flex items-center gap-3 px-3 py-3 rounded-lg">
              <div
                className="w-8 h-8 rounded-lg animate-pulse"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(100, 116, 139, 0.2), rgba(71, 85, 105, 0.25))",
                }}
              ></div>
              <div className="flex-1 min-w-0 text-left">
                <div
                  className="h-3 rounded animate-pulse mb-2"
                  style={{ background: "rgba(100, 116, 139, 0.15)" }}
                ></div>
                <div
                  className="h-4 rounded animate-pulse w-20"
                  style={{ background: "rgba(100, 116, 139, 0.12)" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error with mint theme
  if (error && error !== "UserContext not available") {
    return (
      <div className="relative mb-4">
        <div
          className="relative p-1 rounded-xl"
          style={{
            background:
              "linear-gradient(145deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.15))",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            boxShadow:
              "inset 0 2px 8px rgba(0, 0, 0, 0.4), inset 0 -1px 2px rgba(239, 68, 68, 0.2)",
          }}
        >
          <div
            className="rounded-lg p-0.5"
            style={{
              background:
                "linear-gradient(145deg, rgba(0, 0, 0, 0.3), rgba(239, 68, 68, 0.1))",
              boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div className="w-full flex items-center gap-3 px-3 py-3 rounded-lg">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.9))",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  boxShadow:
                    "0 2px 8px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                }}
              >
                !
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-red-300/90 font-semibold text-sm">
                  Error Loading Brands
                </p>
                <p className="text-red-300/60 text-xs">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show no brands state with mint theme
  if (userBrands.length === 0) {
    return (
      <div className="relative mb-4">
        <div
          className="relative p-1 rounded-xl"
          style={{
            background:
              "linear-gradient(145deg, rgba(100, 116, 139, 0.12), rgba(71, 85, 105, 0.18))",
            border: "1px solid rgba(100, 116, 139, 0.2)",
            boxShadow:
              "inset 0 2px 8px rgba(0, 0, 0, 0.4), inset 0 -1px 2px rgba(100, 116, 139, 0.15)",
          }}
        >
          <div
            className="rounded-lg p-0.5"
            style={{
              background:
                "linear-gradient(145deg, rgba(0, 0, 0, 0.3), rgba(100, 116, 139, 0.08))",
              boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div className="w-full flex items-center gap-3 px-3 py-3 rounded-lg">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(100, 116, 139, 0.6), rgba(71, 85, 105, 0.7))",
                  border: "1px solid rgba(100, 116, 139, 0.3)",
                  boxShadow:
                    "0 2px 8px rgba(100, 116, 139, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                }}
              >
                +
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-slate-300/90 font-semibold text-sm">
                  No Brands
                </p>
                <p className="text-slate-400/60 text-xs">
                  Create your first brand
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show brand info always, but disable switching if only one brand
  const canSwitch = userBrands.length > 1;

  const handleBrandSwitch = (brandId: string) => {
    switchActiveBrand(brandId);
    setIsDropdownOpen(false);
  };

  const handleCreateNewBrand = () => {
    setIsDropdownOpen(false);
    router.push("/onboarding");
  };

  return (
    <div className="relative mb-4" ref={dropdownRef}>
      {/* Mint Maine Well Container */}
      <div
        className="relative p-1 rounded-xl"
        style={{
          background:
            "linear-gradient(145deg, rgba(100, 116, 139, 0.12), rgba(71, 85, 105, 0.18))",
          border: "1px solid rgba(100, 116, 139, 0.2)",
          boxShadow:
            "inset 0 2px 8px rgba(0, 0, 0, 0.4), inset 0 -1px 2px rgba(100, 116, 139, 0.15)",
        }}
      >
        {/* Inner Well Effect */}
        <div
          className="rounded-lg p-0.5"
          style={{
            background:
              "linear-gradient(145deg, rgba(0, 0, 0, 0.3), rgba(100, 116, 139, 0.08))",
            boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.5)",
          }}
        >
          <button
            onClick={
              canSwitch
                ? () => setIsDropdownOpen(!isDropdownOpen)
                : handleCreateNewBrand
            }
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 group cursor-pointer relative overflow-hidden"
            title={canSwitch ? "Switch brands" : "Create new brand"}
            style={{
              background:
                "linear-gradient(135deg, rgba(100, 116, 139, 0.08), rgba(71, 85, 105, 0.12))",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(100, 116, 139, 0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(100, 116, 139, 0.15), rgba(71, 85, 105, 0.2))";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(100, 116, 139, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(100, 116, 139, 0.08), rgba(71, 85, 105, 0.12))";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Subtle Glow Effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(100, 116, 139, 0.08), transparent 70%)",
              }}
            />

            {/* Brand Icon with Muted Theme */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm relative z-10 shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, rgba(100, 116, 139, 0.6), rgba(71, 85, 105, 0.7))",
                border: "1px solid rgba(100, 116, 139, 0.3)",
                boxShadow:
                  "0 2px 8px rgba(100, 116, 139, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
              }}
            >
              {activeBrand?.name?.charAt(0)?.toUpperCase() || "B"}
            </div>

            {/* Brand Name and Indicator with Muted Styling */}
            <div className="flex-1 min-w-0 text-left relative z-10">
              <p className="text-slate-400/70 text-xs font-medium tracking-wide">
                {canSwitch ? "SWITCH BRAND" : "BRAND"}
              </p>
              <p className="text-white font-semibold text-sm truncate">
                {activeBrand?.name || "Select Brand"}
              </p>
            </div>

            {canSwitch ? (
              <div className="flex items-center gap-1 relative z-10">
                <svg
                  className={`w-5 h-5 text-slate-400 transition-all duration-300 ${
                    isDropdownOpen ? "rotate-180 text-slate-300" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{
                    filter: "drop-shadow(0 1px 2px rgba(100, 116, 139, 0.3))",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            ) : (
              // Plus icon for single brand (to create new) with muted styling
              <div className="flex items-center gap-1 relative z-10">
                <div className="w-1 h-1 bg-slate-400 rounded-full opacity-50"></div>
                <svg
                  className="w-5 h-5 text-slate-400/60 group-hover:text-slate-300 transition-all duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{
                    filter: "drop-shadow(0 1px 2px rgba(100, 116, 139, 0.2))",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Dropdown Menu with Muted Theme */}
      {isDropdownOpen && canSwitch && (
        <GlassPanel
          className="absolute bottom-full left-0 right-0 mb-3 rounded-xl overflow-hidden shadow-2xl z-50"
          variant="medium"
          style={{
            background:
              "linear-gradient(145deg, rgba(100, 116, 139, 0.04), rgba(71, 85, 105, 0.08))",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(100, 116, 139, 0.2)",
            boxShadow:
              "0 -8px 32px rgba(100, 116, 139, 0.15), inset 0 1px 0 rgba(100, 116, 139, 0.15), 0 -4px 16px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            className="py-2"
            style={{
              background:
                "linear-gradient(145deg, rgba(0, 0, 0, 0.2), rgba(100, 116, 139, 0.04))",
            }}
          >
            {/* Brand List */}
            {userBrands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => handleBrandSwitch(brand.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-300 text-sm font-body group ${
                  brand.id === activeBrandId
                    ? "bg-slate-500/15 text-white border-l-2 border-slate-400"
                    : "text-slate-300/80 hover:text-white hover:bg-slate-500/8 hover:border-l-2 hover:border-slate-400/50"
                }`}
                style={{
                  borderLeft:
                    brand.id === activeBrandId
                      ? "2px solid rgba(100, 116, 139, 0.6)"
                      : "2px solid transparent",
                }}
              >
                {/* Brand Icon with Muted Theme */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-semibold text-xs shadow-lg"
                  style={{
                    background:
                      brand.id === activeBrandId
                        ? "linear-gradient(135deg, rgba(100, 116, 139, 0.7), rgba(71, 85, 105, 0.8))"
                        : "linear-gradient(135deg, rgba(100, 116, 139, 0.5), rgba(71, 85, 105, 0.6))",
                    border: "1px solid rgba(100, 116, 139, 0.3)",
                    boxShadow:
                      brand.id === activeBrandId
                        ? "0 2px 8px rgba(100, 116, 139, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                        : "0 1px 4px rgba(100, 116, 139, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {brand.name?.charAt(0)?.toUpperCase() || "B"}
                </div>

                {/* Brand Name */}
                <span className="flex-1 text-left truncate font-medium">
                  {brand.name}
                </span>

                {/* Active Indicator */}
              </button>
            ))}

            {/* Muted Divider */}
            <div
              className="my-2 mx-4 border-t"
              style={{
                borderColor: "rgba(100, 116, 139, 0.2)",
                boxShadow: "0 1px 0 rgba(100, 116, 139, 0.08)",
              }}
            ></div>

            {/* Create New Brand Option with Muted Theme */}
            <button
              onClick={handleCreateNewBrand}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-300 hover:bg-slate-500/10 transition-all duration-300 text-sm font-body group"
              style={{
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="flex items-center gap-1">
                <svg
                  className="w-5 h-5 transition-transform group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{
                    filter: "drop-shadow(0 1px 2px rgba(100, 116, 139, 0.2))",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <div className="w-1 h-1 bg-slate-400 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="font-medium">Create New Brand</span>
            </button>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
