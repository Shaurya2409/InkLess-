"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  FaBookOpen,
  FaUser,
  FaCog,
  FaUsers,
  FaArrowLeft,
  FaFeatherAlt,
  FaThumbtack,
  FaChevronRight,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import Link from "next/link";

import CompanionSearch from "@/components/companions/CompanionSearch";

type SidebarProps = {
  onNewNote: () => void;
};

export default function Sidebar({ onNewNote }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isPinned) return;
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  }, [isPinned]);

  // Window edge mousemove detection: opens when cursor is within 22px of the left edge
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (e.clientX <= 22) {
        handleMouseEnter();
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [handleMouseEnter]);

  // Check incoming requests count
  useEffect(() => {
    let active = true;

    async function checkPendingRequests() {
      try {
        const res = await fetch("/api/follow/list");
        const data = await res.json();
        if (active && data.success && Array.isArray(data.requests)) {
          setRequestCount(data.requests.length);
        }
      } catch {
        // Ignore network / auth errors silently
      }
    }

    checkPendingRequests();
    return () => {
      active = false;
    };
  }, []);

  const showSidebar = isOpen || isPinned;

  return (
    <>
      {/* 
        ====================================================
        EDGE HOVER TRIGGER ZONE (Full-height left strip)
        ====================================================
      */}
      <div
        onMouseEnter={handleMouseEnter}
        className="hidden lg:block fixed left-0 top-0 bottom-0 w-6 z-40 cursor-pointer pointer-events-auto"
        aria-hidden="true"
      />

      {/* 
        ====================================================
        LEATHER BOOKMARK PULL-TAB (Visible when retracted)
        ====================================================
      */}
      {!showSidebar && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          onMouseEnter={handleMouseEnter}
          title="Open Navigation Menu"
          className="
            hidden lg:flex fixed left-0 top-1/3 -translate-y-1/2 z-40
            bg-[#7c4a2a] text-[#fefaf2] py-4 px-1.5 rounded-r-xl
            border-y-2 border-r-2 border-[#5c341b] shadow-[4px_2px_15px_rgba(50,25,10,0.3)]
            cursor-pointer group hover:pl-2.5 transition-all duration-200
            flex-col items-center gap-2
          "
        >
          <FaFeatherAlt size={12} className="text-[#f5d5b8] group-hover:rotate-12 transition-transform" />
          <span className="[writing-mode:vertical-rl] font-serif text-[10px] tracking-widest uppercase text-[#edd0b5] font-bold">
            Menu
          </span>
          {requestCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#f39c12] animate-pulse" />
          )}
          <FaChevronRight size={10} className="text-[#f5d5b8] opacity-75 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* 
        ====================================================
        RETRACTABLE NAVIGATION BAR (Warm Cognac Leather)
        ====================================================
      */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          hidden lg:flex fixed left-0 top-0 h-screen w-[240px] z-50 flex-col justify-between px-6 py-8
          text-[#fefaf2] bg-[#7c4a2a]
          border-r-2 border-[#5c341b] shadow-[8px_0_35px_rgba(50,25,10,0.35)]
          transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${showSidebar ? "translate-x-0" : "-translate-x-full pointer-events-none"}
        `}
      >
        {/* Subtle Embossed Leather Edge */}
        <div className="absolute inset-y-0 right-1 w-[1px] bg-[#9c633e] pointer-events-none opacity-60" />

        {/* TOP SECTION */}
        <div className="relative z-10">
          {/* Header Row: Logo & Pin Button */}
          <div className="flex justify-between items-start mb-6">
            <Link
              href="/"
              className="text-left flex flex-col group cursor-pointer block"
              title="Return to Cover"
            >
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#edd0b5] font-sans font-bold">
                Ephemeral
              </span>
              <h1 className="text-2xl font-serif font-black tracking-wider text-[#fff7ee] group-hover:scale-105 transition-transform">
                Inkless
              </h1>
            </Link>

            {/* Pin Sidebar Toggle */}
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? "Unpin sidebar (auto-retract)" : "Pin sidebar open"}
              className={`
                p-2 rounded-lg text-xs transition-all cursor-pointer
                ${
                  isPinned
                    ? "bg-[#5c341b] text-[#ffd6a5] shadow-inner"
                    : "text-[#edd0b5] hover:text-[#fff7ee] hover:bg-[#5c341b]/50"
                }
              `}
            >
              <FaThumbtack size={12} className={isPinned ? "rotate-45" : ""} />
            </button>
          </div>

          <div className="w-full h-[1px] bg-[#9c633e]/50 mb-6" />

          {/* PIN THOUGHT BUTTON */}
          <button
            onClick={onNewNote}
            className="
              w-full mb-6 rounded-xl bg-[#fefaf2] text-[#241810] py-3 text-sm font-serif font-bold tracking-wide
              border border-[#dfd2be] shadow-[0_4px_14px_rgba(40,20,10,0.2)]
              hover:bg-[#fff9f0] hover:scale-[1.02] active:scale-[0.98]
              transition-all duration-150 cursor-pointer flex items-center justify-center gap-2
            "
          >
            <FaFeatherAlt size={13} className="text-[#844f2e]" />
            <span>+ Pin Thought</span>
          </button>

          {/* NAVIGATION LINKS */}
          <div className="flex flex-col gap-2 font-sans text-sm">
            <Link href="/wall">
              <button className="w-full flex items-center gap-3.5 bg-[#5e351d] text-[#fff7ee] rounded-xl px-4 py-3 border border-[#9c633e]/60 hover:translate-x-1 transition-transform duration-150 cursor-pointer text-left shadow-sm">
                <FaBookOpen size={16} className="text-[#f5d5b8]" />
                <span className="font-serif font-bold">The Pages</span>
              </button>
            </Link>

            {/* Quick Companion Search Trigger */}
            <button
              type="button"
              onClick={() => setShowSearchModal(true)}
              className="flex items-center gap-3.5 text-[#edd0b5] hover:text-[#fff7ee] hover:bg-[#5e351d]/50 hover:translate-x-1 transition-all duration-150 w-full text-left cursor-pointer py-2.5 px-3.5 rounded-xl"
            >
              <FaSearch size={15} className="text-[#f5d5b8]" />
              <span className="font-medium">Search Scribes</span>
            </button>

            <Link href="/staff" className="block">
              <button className="flex items-center justify-between text-[#edd0b5] hover:text-[#fff7ee] hover:bg-[#5e351d]/50 hover:translate-x-1 transition-all duration-150 w-full text-left cursor-pointer py-2.5 px-3.5 rounded-xl">
                <div className="flex items-center gap-3.5">
                  <FaUsers size={16} className="text-[#f5d5b8]" />
                  <span className="font-medium">Companions</span>
                </div>
                {requestCount > 0 && (
                  <span className="bg-[#c46927] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-xs animate-pulse">
                    {requestCount}
                  </span>
                )}
              </button>
            </Link>

            <Link href="/profile" className="block">
              <button className="flex items-center gap-3.5 text-[#edd0b5] hover:text-[#fff7ee] hover:bg-[#5e351d]/50 hover:translate-x-1 transition-all duration-150 w-full text-left cursor-pointer py-2.5 px-3.5 rounded-xl">
                <FaUser size={15} className="text-[#f5d5b8]" />
                <span className="font-medium">Author Dossier</span>
              </button>
            </Link>

            <Link href="/settings" className="block">
              <button className="flex items-center gap-3.5 text-[#edd0b5] hover:text-[#fff7ee] hover:bg-[#5e351d]/50 hover:translate-x-1 transition-all duration-150 w-full text-left cursor-pointer py-2.5 px-3.5 rounded-xl">
                <FaCog size={16} className="text-[#f5d5b8]" />
                <span className="font-medium">Desk Settings</span>
              </button>
            </Link>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="relative z-10">
          <div className="border-t border-[#9c633e]/50 mb-4" />

          {/* Back to Cover */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-xs text-[#edd0b5] hover:text-[#fff7ee] hover:translate-x-1 transition-all duration-150 px-2 cursor-pointer font-medium"
            title="Return to Cover Landing"
          >
            <FaArrowLeft size={12} />
            <span>Close Notebook</span>
          </Link>
        </div>
      </aside>

      {/* 
        ====================================================
        COMPANION SEARCH MODAL OVERLAY
        ====================================================
      */}
      {showSearchModal && (
        <div
          onClick={() => setShowSearchModal(false)}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#faf7f0] rounded-2xl shadow-[0_25px_60px_rgba(30,15,5,0.45)] border border-[#d6cbba] p-6 w-full max-w-lg relative text-[#24211e]"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#e2d8c7]">
              <div className="flex items-center gap-2">
                <FaFeatherAlt size={14} className="text-[#844f2e]" />
                <h2 className="font-serif font-bold text-lg text-[#1e1b18]">Discover Companions</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="text-[#8c7b6c] hover:text-[#2c241c] p-1.5 rounded-lg hover:bg-[#f0eae0] cursor-pointer transition-colors"
                title="Close"
              >
                <FaTimes size={15} />
              </button>
            </div>

            <CompanionSearch />
          </div>
        </div>
      )}
    </>
  );
}
