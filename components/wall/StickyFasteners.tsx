"use client";

import React, { memo } from "react";
import { FastenerType } from "@/lib/stationeryThemes";

interface StickyFastenersProps {
  fastener: FastenerType;
  position?: "center" | "left" | "right";
}

export const BrassClip = memo(function BrassClip() {
  return (
    <svg
      width="20"
      height="34"
      viewBox="0 0 20 34"
      fill="none"
      className="filter drop-shadow-[0_2px_3px_rgba(20,15,10,0.45)] pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="brassSheen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff3b8" />
          <stop offset="25%" stopColor="#e5bf45" />
          <stop offset="55%" stopColor="#a3781e" />
          <stop offset="85%" stopColor="#674a0d" />
          <stop offset="100%" stopColor="#ffe68a" />
        </linearGradient>
      </defs>
      {/* Outer loop */}
      <path
        d="M 5 10 V 27 C 5 29.8 7.2 32 10 32 C 12.8 32 15 29.8 15 27 V 7 C 15 3.7 12.3 1 9 1 C 5.7 1 3 3.7 3 7 V 29"
        stroke="#231a0e"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Metallic gradient core */}
      <path
        d="M 5 10 V 27 C 5 29.8 7.2 32 10 32 C 12.8 32 15 29.8 15 27 V 7 C 15 3.7 12.3 1 9 1 C 5.7 1 3 3.7 3 7 V 29"
        stroke="url(#brassSheen)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

export const KraftTape = memo(function KraftTape() {
  return (
    <div
      className="w-16 h-5 kraft-tape-strip transform -rotate-1 pointer-events-none"
      aria-hidden="true"
    />
  );
});

export const DraftTape = memo(function DraftTape() {
  return (
    <div
      className="w-16 h-5 draft-tape-strip transform rotate-1 pointer-events-none"
      aria-hidden="true"
    />
  );
});

export const PegHoles = memo(function PegHoles() {
  return (
    <div
      className="flex items-center justify-between w-28 px-1 py-0.5 pointer-events-none opacity-85"
      aria-hidden="true"
    >
      {/* Left Circular Peg Hole */}
      <div className="peghole-punch" />
      {/* Center Oblong Registration Hole */}
      <div className="peghole-oblong" />
      {/* Right Circular Peg Hole */}
      <div className="peghole-punch" />
    </div>
  );
});

export const FastenerRenderer = memo(function FastenerRenderer({
  fastener,
  position = "center",
}: StickyFastenersProps) {
  if (fastener === "pegholes") {
    return (
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
        <PegHoles />
      </div>
    );
  }

  const posClasses =
    position === "left"
      ? "left-5"
      : position === "right"
      ? "right-5"
      : "left-1/2 -translate-x-1/2";

  if (fastener === "brass-clip") {
    return (
      <div className={`absolute -top-4 ${posClasses} z-20`}>
        <BrassClip />
      </div>
    );
  }

  if (fastener === "draft-tape") {
    return (
      <div className={`absolute -top-2.5 ${posClasses} z-20`}>
        <DraftTape />
      </div>
    );
  }

  // Default to kraft-tape
  return (
    <div className={`absolute -top-2.5 ${posClasses} z-20`}>
      <KraftTape />
    </div>
  );
});
