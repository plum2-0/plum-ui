"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface MobileSidebarWrapperProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function MobileSidebarWrapper({
  children,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}: MobileSidebarWrapperProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showHamburger, setShowHamburger] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onClose = externalOnClose || (() => setInternalIsOpen(false));
  const onOpen = () => setInternalIsOpen(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll-based hamburger visibility
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Only apply on mobile
          if (window.innerWidth >= 768) {
            setShowHamburger(true);
            ticking = false;
            return;
          }

          // Try to find the main scrolling element
          const mainElement = document.querySelector('main');
          let currentScrollY = 0;
          
          if (mainElement) {
            currentScrollY = mainElement.scrollTop;
          } else {
            // Fallback to window scroll
            currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
          }
          
          // Clear any existing timeout
          if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current);
          }

          // Determine scroll direction
          if (currentScrollY <= 50) {
            // Near top - always show
            setShowHamburger(true);
          } else if (currentScrollY < lastScrollY.current) {
            // Scrolling up - show hamburger
            setShowHamburger(true);
          } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
            // Scrolling down and past threshold - hide hamburger
            setShowHamburger(false);
          }

          // Set a timeout to show hamburger after scrolling stops
          scrollTimeout.current = setTimeout(() => {
            setShowHamburger(true);
          }, 2000);

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    // Attach to multiple possible scroll targets
    const setupScrollListeners = () => {
      // Try main element first
      setTimeout(() => {
        const mainElement = document.querySelector('main');
        if (mainElement) {
          mainElement.addEventListener("scroll", handleScroll, { passive: true });
        }
      }, 100);
      
      // Always attach to window as fallback
      window.addEventListener("scroll", handleScroll, { passive: true });
      document.addEventListener("scroll", handleScroll, { passive: true });
    };

    setupScrollListeners();

    return () => {
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const mobileOverlay = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] max-w-[85vw] z-50 transform transition-transform duration-300 ease-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors md:hidden"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="h-full w-full overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Hamburger Menu Button - Only show if using internal state */}
      {externalIsOpen === undefined && (
        <button
          onClick={onOpen}
          className={`fixed top-4 left-4 z-30 p-2 rounded-lg bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 md:hidden ${
            showHamburger 
              ? "translate-y-0 opacity-100" 
              : "-translate-y-20 opacity-0 pointer-events-none"
          }`}
          aria-label="Open menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block md:w-64 shrink-0 h-full">{children}</div>

      {/* Mobile Sidebar with Portal */}
      {mounted && createPortal(mobileOverlay, document.body)}
    </>
  );
}

// Export a hook for managing sidebar state from parent components
export function useMobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return { isOpen, open, close, toggle };
}