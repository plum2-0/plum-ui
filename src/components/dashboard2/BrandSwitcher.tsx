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
  const [isHovered, setIsHovered] = useState(false);
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

  // Show loading state with liquid glass theme
  if (isLoading) {
    return (
      <div className="relative mb-4">
        <div
          className="relative rounded-2xl backdrop-blur-xl animate-pulse overflow-hidden"
          style={{
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
          <div className="relative p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl animate-pulse"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              }}
            />
            <div className="flex-1 min-w-0">
              <div
                className="h-3 rounded-full animate-pulse mb-2 w-16"
                style={{ background: "rgba(255, 255, 255, 0.1)" }}
              />
              <div
                className="h-4 rounded-full animate-pulse w-24"
                style={{ background: "rgba(255, 255, 255, 0.2)" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state with liquid glass theme
  if (error && error !== "UserContext not available") {
    return (
      <div className="relative mb-4">
        <div
          className="relative rounded-2xl backdrop-blur-xl overflow-hidden"
          style={{
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            boxShadow:
              "0 8px 32px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-50"></div>
          <div className="relative p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{
                background:
                  "linear-gradient(135deg, rgba(239, 68, 68, 0.6), rgba(220, 38, 38, 0.8))",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                boxShadow:
                  "0 4px 16px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
              }}
            >
              !
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-red-200 font-semibold text-sm">
                Error Loading Brands
              </p>
              <p className="text-red-300/70 text-xs">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show no brands state with liquid glass theme
  if (userBrands.length === 0) {
    return (
      <div className="relative mb-4">
        <div
          className="relative rounded-2xl backdrop-blur-xl overflow-hidden"
          style={{
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
          <div className="relative p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow:
                  "0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
              }}
            >
              +
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-white font-semibold text-sm">No Brands</p>
              <p className="text-white/60 text-xs">Create your first brand</p>
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
      {/* Liquid Glass Container */}
      <div
        className={`relative rounded-2xl backdrop-blur-xl overflow-hidden transition-all duration-500 ${
          isHovered ? "scale-[1.02]" : "scale-100"
        }`}
        style={{
          background: "rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: isHovered
            ? "0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
            : "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Liquid Glass Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent transition-opacity duration-500 ${
            isHovered ? "opacity-100" : "opacity-50"
          }`}
        />

        {/* Flowing Accent */}
        <div
          className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-500 ${
            isHovered ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`}
        />

        <button
          onClick={
            canSwitch
              ? () => setIsDropdownOpen(!isDropdownOpen)
              : handleCreateNewBrand
          }
          className="w-full p-3 flex items-center gap-3 transition-all duration-300 relative group"
          title={canSwitch ? "Switch brands" : "Create new brand"}
        >
          {/* Ripple Effect */}
          <div
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transition-all duration-700 ${
              isHovered
                ? "translate-x-full opacity-100"
                : "-translate-x-full opacity-0"
            }`}
          />

          {/* Brand Avatar - Liquid Glass Style */}
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm relative transition-all duration-300 ${
              isHovered ? "scale-110 rotate-3" : "scale-100 rotate-0"
            }`}
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05))",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />
            <span className="relative z-10">
              {activeBrand?.name?.charAt(0)?.toUpperCase() || "B"}
            </span>
          </div>

          {/* Brand Info */}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-white/30 text-xs font-medium tracking-wider uppercase mb-1">
              BRAND
            </p>
            <p className="text-white font-semibold text-sm truncate">
              {activeBrand?.name || "Select Brand"}
            </p>
          </div>

          {/* Action Icon */}
          <div className="flex items-center justify-center">
            {canSwitch ? (
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isDropdownOpen ? "rotate-180 bg-white/10" : "rotate-0 bg-white/5"
                }`}
                style={{
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <svg
                  className="w-4 h-4 text-white/80"
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
            ) : (
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isHovered ? "bg-white/15 scale-110" : "bg-white/5"
                }`}
                style={{
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <svg
                  className="w-4 h-4 text-white/80"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Liquid Glass Dropdown Menu */}
      {isDropdownOpen && canSwitch && (
        <div
          className="absolute bottom-full left-0 right-0 mb-3 rounded-2xl backdrop-blur-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-2 duration-300"
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow:
              "0 -20px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          }}
        >
          {/* Liquid Glass Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-60" />

          {/* Flowing Top Accent */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <div className="relative py-3">
            {/* Brand List */}
            {userBrands.map((brand, index) => (
              <button
                key={brand.id}
                onClick={() => handleBrandSwitch(brand.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 transition-all duration-300 relative group ${
                  brand.id === activeBrandId
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                }`}
                style={{
                  background:
                    brand.id === activeBrandId
                      ? "linear-gradient(90deg, rgba(255, 255, 255, 0.1), transparent)"
                      : "transparent",
                }}
              >
                {/* Active Indicator Line */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
                    brand.id === activeBrandId
                      ? "bg-gradient-to-b from-white/60 to-white/20 opacity-100"
                      : "bg-white/20 opacity-0 group-hover:opacity-50"
                  }`}
                />

                {/* Hover Ripple */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-full group-hover:translate-x-full" />

                {/* Brand Avatar */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-semibold text-sm transition-all duration-300 ${
                    brand.id === activeBrandId
                      ? "scale-105"
                      : "scale-100 group-hover:scale-105"
                  }`}
                  style={{
                    background:
                      brand.id === activeBrandId
                        ? "linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1))"
                        : "linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow:
                      brand.id === activeBrandId
                        ? "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.4)"
                        : "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />
                  <span className="relative z-10">
                    {brand.name?.charAt(0)?.toUpperCase() || "B"}
                  </span>
                </div>

                {/* Brand Name */}
                <div className="flex-1 text-left">
                  <p
                    className={`font-semibold truncate transition-all duration-300 ${
                      brand.id === activeBrandId
                        ? "text-sm text-white"
                        : "text-sm text-white/80 group-hover:text-white"
                    }`}
                  >
                    {brand.name}
                  </p>
                  {brand.id === activeBrandId && (
                    <p className="text-xs text-white/50 uppercase tracking-wider">
                      Current
                    </p>
                  )}
                </div>

                {/* Active Check */}
                {brand.id === activeBrandId && (
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}

            {/* Liquid Glass Divider */}
            <div className="my-3 mx-4 relative">
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent blur-sm" />
            </div>

            {/* Create New Brand Option */}
            <button
              onClick={handleCreateNewBrand}
              className="w-full flex items-center gap-4 px-4 py-3 text-white/60 hover:text-white transition-all duration-300 group relative"
            >
              {/* Hover Ripple */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-full group-hover:translate-x-full" />

              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <svg
                  className="w-5 h-5 text-white/80 group-hover:text-white transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <span className="font-semibold">Create New Brand</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
