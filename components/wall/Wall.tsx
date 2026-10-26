"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import StickyNote from "./StickyNote";
import CornerFlipbook from "./CornerFlipbook";
import { FaChevronLeft, FaChevronRight, FaFeatherAlt } from "react-icons/fa";

type Note = {
  _id: string;
  text: string;
  x?: number;
  y?: number;
  createdAt: string;
  isOwner: boolean;
  author: {
    username: string;
  };
};

type WallProps = {
  notes: Note[];
  setNotes?: React.Dispatch<React.SetStateAction<Note[]>>;
  loadNotes: () => void;
  onNewNote?: () => void;
};

const NOTES_PER_PAGE = 6;
const NOTES_PER_SPREAD = 12; // 6 left + 6 right on desktop

export default function Wall({
  notes,
  loadNotes,
  onNewNote,
}: WallProps) {
  // Desktop spread: 0, 1, 2...
  const [spreadIndex, setSpreadIndex] = useState(0);
  // Mobile single page: 0, 1, 2...
  const [mobilePageIndex, setMobilePageIndex] = useState(0);

  // Desktop 3D Page Turn Animation State
  const [flippingLeaf, setFlippingLeaf] = useState<{
    direction: "next" | "prev";
    fromSpread: number;
    toSpread: number;
  } | null>(null);
  const flippingLeafRef = useRef<{
    direction: "next" | "prev";
    fromSpread: number;
    toSpread: number;
  } | null>(null);
  const flipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile Top-Spiral Notepad Flip Animation State
  const [mobileFlip, setMobileFlip] = useState<{
    direction: "next" | "prev";
    fromPage: number;
    toPage: number;
  } | null>(null);
  const mobileFlipRef = useRef<{
    direction: "next" | "prev";
    fromPage: number;
    toPage: number;
  } | null>(null);
  const mobileFlipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 5-Minute Background Auto-Reload Cycle
  useEffect(() => {
    const FIVE_MINUTES = 5 * 60 * 1000;
    const interval = setInterval(() => {
      loadNotes();
    }, FIVE_MINUTES);

    return () => clearInterval(interval);
  }, [loadNotes]);

  // Real-time Expiration Trigger: reloads notes precisely when the earliest note reaches 6 hours
  useEffect(() => {
    if (!notes || notes.length === 0) return;

    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
    const now = Date.now();

    let earliestRemaining = Infinity;

    for (const note of notes) {
      const createdTime = new Date(note.createdAt).getTime();
      const expiresTime = createdTime + SIX_HOURS_MS;
      const remaining = expiresTime - now;

      if (remaining > 0 && remaining < earliestRemaining) {
        earliestRemaining = remaining;
      }
    }

    if (earliestRemaining !== Infinity) {
      // Trigger reload at the precise moment of note expiration (plus 500ms safety buffer)
      const timer = setTimeout(() => {
        loadNotes();
      }, Math.max(1000, earliestRemaining + 500));

      return () => clearTimeout(timer);
    }
  }, [notes, loadNotes]);

  // Clean up any pending animation timeouts on unmount
  useEffect(() => {
    return () => {
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
      if (mobileFlipTimeoutRef.current) clearTimeout(mobileFlipTimeoutRef.current);
    };
  }, []);

  // Dynamic Spreads and Pages based on sticky notes
  // Automatically unlocks a fresh new spread/page whenever current slots fill up
  const totalSpreads = useMemo(() => {
    const fromNotes = Math.floor(notes.length / NOTES_PER_SPREAD) + 1;
    return Math.max(1, fromNotes);
  }, [notes.length]);

  const totalMobilePages = useMemo(() => {
    const fromNotes = Math.floor(notes.length / NOTES_PER_PAGE) + 1;
    return Math.max(1, fromNotes);
  }, [notes.length]);

  // Derived in-bounds spread/page indices without triggering cascading render effects
  const activeSpreadIndex = Math.min(spreadIndex, Math.max(0, totalSpreads - 1));
  const activeMobilePageIndex = Math.min(mobilePageIndex, Math.max(0, totalMobilePages - 1));

  // Auto-advance to the newest spread/page when a new note is pinned
  const prevNotesLengthRef = useRef(notes.length);
  useEffect(() => {
    if (notes.length > prevNotesLengthRef.current) {
      const targetSpread = Math.floor((notes.length - 1) / NOTES_PER_SPREAD);
      setSpreadIndex(targetSpread);
      const targetPage = Math.floor((notes.length - 1) / NOTES_PER_PAGE);
      setMobilePageIndex(targetPage);
    }
    prevNotesLengthRef.current = notes.length;
  }, [notes.length]);

  // Rapid Page Riffling Engine (makes stickman dance at ~18 fps!)
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const riffleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopRiffle = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (riffleIntervalRef.current) {
      clearInterval(riffleIntervalRef.current);
      riffleIntervalRef.current = null;
    }
  }, []);

  const startRiffle = useCallback(
    (dir: "next" | "prev" = "next") => {
      if (totalSpreads <= 1 && totalMobilePages <= 1) return;
      stopRiffle();
      holdTimeoutRef.current = setTimeout(() => {
        if (flipTimeoutRef.current) {
          clearTimeout(flipTimeoutRef.current);
          flipTimeoutRef.current = null;
        }
        if (mobileFlipTimeoutRef.current) {
          clearTimeout(mobileFlipTimeoutRef.current);
          mobileFlipTimeoutRef.current = null;
        }
        flippingLeafRef.current = null;
        mobileFlipRef.current = null;
        setFlippingLeaf(null);
        setMobileFlip(null);

        riffleIntervalRef.current = setInterval(() => {
          setSpreadIndex((prev) => {
            if (totalSpreads <= 1) return 0;
            if (dir === "next") {
              return prev >= totalSpreads - 1 ? 0 : prev + 1;
            } else {
              return prev <= 0 ? totalSpreads - 1 : prev - 1;
            }
          });
          setMobilePageIndex((prev) => {
            if (totalMobilePages <= 1) return 0;
            if (dir === "next") {
              return prev >= totalMobilePages - 1 ? 0 : prev + 1;
            } else {
              return prev <= 0 ? totalMobilePages - 1 : prev - 1;
            }
          });
        }, 55); // ~18 fps rapid flicking
      }, 220);
    },
    [stopRiffle, totalSpreads, totalMobilePages]
  );

  // Handle Desktop Spread Flipping with Authentic 3D Page Turn
  const handleNextSpread = useCallback(() => {
    if (totalSpreads <= 1 || activeSpreadIndex >= totalSpreads - 1) return;

    if (riffleIntervalRef.current) {
      setSpreadIndex((prev) => Math.min(totalSpreads - 1, prev + 1));
      return;
    }

    if (flipTimeoutRef.current) {
      clearTimeout(flipTimeoutRef.current);
      flipTimeoutRef.current = null;
    }
    if (flippingLeafRef.current) {
      setSpreadIndex(flippingLeafRef.current.toSpread);
      flippingLeafRef.current = null;
      setFlippingLeaf(null);
    }

    setSpreadIndex((currentSpread) => {
      if (currentSpread >= totalSpreads - 1) return currentSpread;
      const targetSpread = currentSpread + 1;
      const flipData = {
        direction: "next" as const,
        fromSpread: currentSpread,
        toSpread: targetSpread,
      };
      flippingLeafRef.current = flipData;
      setFlippingLeaf(flipData);

      flipTimeoutRef.current = setTimeout(() => {
        setSpreadIndex(targetSpread);
        flippingLeafRef.current = null;
        setFlippingLeaf(null);
        flipTimeoutRef.current = null;
      }, 500);

      return currentSpread;
    });
  }, [totalSpreads, activeSpreadIndex]);

  const handlePrevSpread = useCallback(() => {
    if (totalSpreads <= 1 || activeSpreadIndex <= 0) return;

    if (riffleIntervalRef.current) {
      setSpreadIndex((prev) => Math.max(0, prev - 1));
      return;
    }

    if (flipTimeoutRef.current) {
      clearTimeout(flipTimeoutRef.current);
      flipTimeoutRef.current = null;
    }
    if (flippingLeafRef.current) {
      setSpreadIndex(flippingLeafRef.current.toSpread);
      flippingLeafRef.current = null;
      setFlippingLeaf(null);
    }

    setSpreadIndex((currentSpread) => {
      if (currentSpread <= 0) return currentSpread;
      const targetSpread = currentSpread - 1;
      const flipData = {
        direction: "prev" as const,
        fromSpread: currentSpread,
        toSpread: targetSpread,
      };
      flippingLeafRef.current = flipData;
      setFlippingLeaf(flipData);

      flipTimeoutRef.current = setTimeout(() => {
        setSpreadIndex(targetSpread);
        flippingLeafRef.current = null;
        setFlippingLeaf(null);
        flipTimeoutRef.current = null;
      }, 500);

      return currentSpread;
    });
  }, [totalSpreads, activeSpreadIndex]);

  // Handle Mobile Page Flipping with Top-Spiral Notepad Roll
  const handleNextMobilePage = useCallback(() => {
    if (totalMobilePages <= 1 || activeMobilePageIndex >= totalMobilePages - 1) return;

    if (riffleIntervalRef.current) {
      setMobilePageIndex((prev) => Math.min(totalMobilePages - 1, prev + 1));
      return;
    }

    if (mobileFlipTimeoutRef.current) {
      clearTimeout(mobileFlipTimeoutRef.current);
      mobileFlipTimeoutRef.current = null;
    }
    if (mobileFlipRef.current) {
      setMobilePageIndex(mobileFlipRef.current.toPage);
      mobileFlipRef.current = null;
      setMobileFlip(null);
    }

    setMobilePageIndex((currentPage) => {
      if (currentPage >= totalMobilePages - 1) return currentPage;
      const targetPage = currentPage + 1;
      const flipData = {
        direction: "next" as const,
        fromPage: currentPage,
        toPage: targetPage,
      };
      mobileFlipRef.current = flipData;
      setMobileFlip(flipData);

      mobileFlipTimeoutRef.current = setTimeout(() => {
        setMobilePageIndex(targetPage);
        mobileFlipRef.current = null;
        setMobileFlip(null);
        mobileFlipTimeoutRef.current = null;
      }, 430);

      return currentPage;
    });
  }, [totalMobilePages, activeMobilePageIndex]);

  const handlePrevMobilePage = useCallback(() => {
    if (totalMobilePages <= 1 || activeMobilePageIndex <= 0) return;

    if (riffleIntervalRef.current) {
      setMobilePageIndex((prev) => Math.max(0, prev - 1));
      return;
    }

    if (mobileFlipTimeoutRef.current) {
      clearTimeout(mobileFlipTimeoutRef.current);
      mobileFlipTimeoutRef.current = null;
    }
    if (mobileFlipRef.current) {
      setMobilePageIndex(mobileFlipRef.current.toPage);
      mobileFlipRef.current = null;
      setMobileFlip(null);
    }

    setMobilePageIndex((currentPage) => {
      if (currentPage <= 0) return currentPage;
      const targetPage = currentPage - 1;
      const flipData = {
        direction: "prev" as const,
        fromPage: currentPage,
        toPage: targetPage,
      };
      mobileFlipRef.current = flipData;
      setMobileFlip(flipData);

      mobileFlipTimeoutRef.current = setTimeout(() => {
        setMobilePageIndex(targetPage);
        mobileFlipRef.current = null;
        setMobileFlip(null);
        mobileFlipTimeoutRef.current = null;
      }, 430);

      return currentPage;
    });
  }, [totalMobilePages, activeMobilePageIndex]);

  // Keyboard navigation & hold-to-riffle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        if (!e.repeat) {
          if (totalSpreads > 1) handleNextSpread();
          if (totalMobilePages > 1) handleNextMobilePage();
        } else if (!riffleIntervalRef.current && (totalSpreads > 1 || totalMobilePages > 1)) {
          stopRiffle();
          if (flipTimeoutRef.current) {
            clearTimeout(flipTimeoutRef.current);
            flipTimeoutRef.current = null;
          }
          if (mobileFlipTimeoutRef.current) {
            clearTimeout(mobileFlipTimeoutRef.current);
            mobileFlipTimeoutRef.current = null;
          }
          flippingLeafRef.current = null;
          mobileFlipRef.current = null;
          setFlippingLeaf(null);
          setMobileFlip(null);

          riffleIntervalRef.current = setInterval(() => {
            setSpreadIndex((prev) => (totalSpreads <= 1 ? 0 : prev >= totalSpreads - 1 ? 0 : prev + 1));
            setMobilePageIndex((prev) => (totalMobilePages <= 1 ? 0 : prev >= totalMobilePages - 1 ? 0 : prev + 1));
          }, 55);
        }
      } else if (e.key === "ArrowLeft") {
        if (!e.repeat) {
          if (totalSpreads > 1) handlePrevSpread();
          if (totalMobilePages > 1) handlePrevMobilePage();
        } else if (!riffleIntervalRef.current && (totalSpreads > 1 || totalMobilePages > 1)) {
          stopRiffle();
          if (flipTimeoutRef.current) {
            clearTimeout(flipTimeoutRef.current);
            flipTimeoutRef.current = null;
          }
          if (mobileFlipTimeoutRef.current) {
            clearTimeout(mobileFlipTimeoutRef.current);
            mobileFlipTimeoutRef.current = null;
          }
          flippingLeafRef.current = null;
          mobileFlipRef.current = null;
          setFlippingLeaf(null);
          setMobileFlip(null);

          riffleIntervalRef.current = setInterval(() => {
            setSpreadIndex((prev) => (totalSpreads <= 1 ? 0 : prev <= 0 ? totalSpreads - 1 : prev - 1));
            setMobilePageIndex((prev) => (totalMobilePages <= 1 ? 0 : prev <= 0 ? totalMobilePages - 1 : prev - 1));
          }, 55);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        stopRiffle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      stopRiffle();
    };
  }, [
    handleNextSpread,
    handlePrevSpread,
    handleNextMobilePage,
    handlePrevMobilePage,
    stopRiffle,
    totalSpreads,
    totalMobilePages,
  ]);

  // Drag-to-flip edge tracking for Desktop & Mobile
  const dragStartX = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, textarea, input, .select-text")) {
      return;
    }
    dragStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const deltaX = e.clientX - dragStartX.current;
    dragStartX.current = null;

    if (deltaX < -70) {
      if (totalSpreads > 1) handleNextSpread();
      if (totalMobilePages > 1) handleNextMobilePage();
    } else if (deltaX > 70) {
      if (totalSpreads > 1) handlePrevSpread();
      if (totalMobilePages > 1) handlePrevMobilePage();
    }
  };

  // Helper to render Desktop Page Content
  const renderDesktopPageContent = (
    spreadIdx: number,
    side: "left" | "right",
    isInteractive: boolean
  ) => {
    const start = spreadIdx * NOTES_PER_SPREAD + (side === "left" ? 0 : NOTES_PER_PAGE);
    const pageNotes = notes.slice(start, start + NOTES_PER_PAGE);
    const leafNumber = side === "left" ? spreadIdx * 2 + 1 : spreadIdx * 2 + 2;

    if (side === "left") {
      return (
        <div className="relative flex-1 bg-parchment rounded-l-2xl p-6 lg:p-8 flex flex-col justify-between border-r border-[#d4c8b6] shadow-[-6px_0_15px_rgba(0,0,0,0.06)] overflow-hidden h-full">
          {/* Spine gradient shadow on inner edge */}
          <div className="absolute top-0 right-0 bottom-0 w-16 spine-shadow-left pointer-events-none z-10" />

          {/* Left Page Header */}
          <div className="flex justify-between items-center pb-2 border-b border-[#e2d8c7] mb-3 text-xs font-serif text-[#665b4f]">
            <span className="italic tracking-widest uppercase">The Ledger</span>
            <span className="font-sans text-[10px] tracking-wider text-[#918370]">
              Leaf {leafNumber}
            </span>
          </div>

          {/* 6-Slot Grid for Left Page (2 cols x 3 rows) */}
          <div className="grid grid-cols-2 grid-rows-3 gap-3.5 flex-1 z-20">
            {[...Array(NOTES_PER_PAGE)].map((_, i) => {
              const note = pageNotes[i];
              if (note) {
                return (
                  <StickyNote
                    key={note._id}
                    note={note}
                    slotIndex={i}
                    onDelete={isInteractive ? loadNotes : () => {}}
                    onUpdate={isInteractive ? loadNotes : () => {}}
                  />
                );
              }
              return (
                <div
                  key={`empty-left-${i}`}
                  onClick={isInteractive ? onNewNote : undefined}
                  className="rounded border border-dashed border-[#dcd3c1] p-3 flex flex-col items-center justify-center text-center opacity-40 hover:opacity-85 hover:border-[#a89b88] transition-all cursor-pointer group"
                >
                  <FaFeatherAlt
                    className="text-[#a89b88] group-hover:scale-110 group-hover:text-[#2c2621] transition-all mb-1"
                    size={14}
                  />
                  <span className="text-[11px] font-serif italic text-[#6e6355]">
                    Blank leaf slot
                  </span>
                </div>
              );
            })}
          </div>

          {/* Left Page Footer & Bottom-Left Corner Dog-Ear */}
          <div className="flex justify-between items-center pt-3 text-xs font-serif text-[#786c5e]">
            <span className="text-[11px] font-sans tracking-widest uppercase">
              Inkless • Vol. I
            </span>
            <span className="font-semibold">{leafNumber}</span>
          </div>

          {/* Bottom-Left Interactive Dog-Ear */}
          {isInteractive && spreadIdx > 0 && totalSpreads > 1 && (
            <div
              onClick={handlePrevSpread}
              className="absolute bottom-0 left-0 w-10 h-10 [clip-path:polygon(0_0,_0_100%,_100%_100%)] bg-[#ebd8be] shadow-sm hover:scale-125 transition-transform cursor-pointer z-30"
              title="Flip to previous leaf (←)"
            />
          )}
        </div>
      );
    }

    // Right Side
    return (
      <div className="relative flex-1 bg-parchment rounded-r-2xl p-6 lg:p-8 flex flex-col justify-between border-l border-[#d4c8b6] shadow-[6px_0_15px_rgba(0,0,0,0.06)] overflow-hidden h-full">
        {/* Spine gradient shadow on inner edge */}
        <div className="absolute top-0 left-0 bottom-0 w-16 spine-shadow-right pointer-events-none z-10" />

        {/* Right Page Header */}
        <div className="flex justify-between items-center pb-2 border-b border-[#e2d8c7] mb-3 text-xs font-serif text-[#665b4f]">
          <span className="font-sans text-[10px] tracking-wider text-[#918370]">
            Leaf {leafNumber}
          </span>
          <span className="italic tracking-widest uppercase">Ephemeral Words</span>
        </div>

        {/* 6-Slot Grid for Right Page (2 cols x 3 rows) */}
        <div className="grid grid-cols-2 grid-rows-3 gap-3.5 flex-1 z-20">
          {[...Array(NOTES_PER_PAGE)].map((_, i) => {
            const note = pageNotes[i];
            if (note) {
              return (
                <StickyNote
                  key={note._id}
                  note={note}
                  slotIndex={NOTES_PER_PAGE + i}
                  onDelete={isInteractive ? loadNotes : () => {}}
                  onUpdate={isInteractive ? loadNotes : () => {}}
                />
              );
            }
            return (
              <div
                key={`empty-right-${i}`}
                onClick={isInteractive ? onNewNote : undefined}
                className="rounded border border-dashed border-[#dcd3c1] p-3 flex flex-col items-center justify-center text-center opacity-40 hover:opacity-85 hover:border-[#a89b88] transition-all cursor-pointer group"
              >
                <FaFeatherAlt
                  className="text-[#a89b88] group-hover:scale-110 group-hover:text-[#2c2621] transition-all mb-1"
                  size={14}
                />
                <span className="text-[11px] font-serif italic text-[#6e6355]">
                  Blank leaf slot
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Page Footer & Corner Flipbook */}
        <div className="flex justify-between items-end pt-2 text-xs font-serif text-[#786c5e] z-20">
          <div className="flex flex-col gap-0.5 pb-1">
            <span className="font-sans text-[10px] tracking-wider text-[#918370]">
              Leaf {leafNumber}
            </span>
            <span className="text-[10px] font-sans tracking-widest uppercase opacity-75">
              Auto-syncs active ink
            </span>
          </div>

          {/* Bottom-Right Dynamic Corner Flipbook */}
          <CornerFlipbook
            pageNumber={leafNumber}
            spreadIndex={spreadIdx}
            onFlipNext={isInteractive && totalSpreads > 1 ? handleNextSpread : undefined}
            onStartRiffle={isInteractive && totalSpreads > 1 ? () => startRiffle("next") : undefined}
            onStopRiffle={isInteractive && totalSpreads > 1 ? stopRiffle : undefined}
            canFlip={totalSpreads > 1 && spreadIdx < totalSpreads - 1}
            isLastSpread={totalSpreads <= 1 || spreadIdx >= totalSpreads - 1}
          />
        </div>
      </div>
    );
  };

  // Helper to render Mobile Notepad Page Content
  const renderMobilePageContent = (pageIdx: number, isInteractive: boolean) => {
    const start = pageIdx * NOTES_PER_PAGE;
    const pageNotes = notes.slice(start, start + NOTES_PER_PAGE);

    return (
      <div className="flex flex-col flex-1 justify-between h-full">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-[#e2d8c7] mb-3 text-xs font-serif text-[#665b4f]">
          <span className="italic tracking-wider">The Living Notepad</span>
          <span className="font-sans text-[10px] tracking-wider text-[#918370]">
            Page {pageIdx + 1}
          </span>
        </div>

        {/* 6-Slot Grid on Mobile (2 cols x 3 rows) */}
        <div className="grid grid-cols-2 gap-2.5 flex-1">
          {[...Array(NOTES_PER_PAGE)].map((_, i) => {
            const note = pageNotes[i];
            if (note) {
              return (
                <StickyNote
                  key={note._id}
                  note={note}
                  slotIndex={i}
                  onDelete={isInteractive ? loadNotes : () => {}}
                  onUpdate={isInteractive ? loadNotes : () => {}}
                />
              );
            }
            return (
              <div
                key={`empty-mobile-${i}`}
                onClick={isInteractive ? onNewNote : undefined}
                className="rounded border border-dashed border-[#dcd3c1] p-3 flex flex-col items-center justify-center text-center opacity-40 hover:opacity-85 transition-all cursor-pointer min-h-[140px]"
              >
                <FaFeatherAlt className="text-[#a89b8c] mb-1" size={14} />
                <span className="text-[10px] font-serif italic text-[#6e6355]">Blank slot</span>
              </div>
            );
          })}
        </div>

        {/* Mobile Footer with Corner Flipbook */}
        <div className="flex justify-between items-end pt-3 text-[10px] font-sans text-[#786c5e]">
          <div className="flex flex-col gap-0.5 pb-1">
            <span>Active ink sync</span>
            <span>6 notes/leaf</span>
          </div>

          <CornerFlipbook
            pageNumber={pageIdx + 1}
            spreadIndex={pageIdx}
            onFlipNext={isInteractive && totalMobilePages > 1 ? handleNextMobilePage : undefined}
            onStartRiffle={isInteractive && totalMobilePages > 1 ? () => startRiffle("next") : undefined}
            onStopRiffle={isInteractive && totalMobilePages > 1 ? stopRiffle : undefined}
            canFlip={totalMobilePages > 1 && pageIdx < totalMobilePages - 1}
            isLastSpread={totalMobilePages <= 1 || pageIdx >= totalMobilePages - 1}
            className="scale-90 origin-bottom-right"
          />
        </div>
      </div>
    );
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="relative flex-1 min-h-screen bg-desk flex flex-col justify-center items-center p-3 md:p-6 lg:p-10 select-none overflow-x-hidden"
    >
      {/* Golden evening sunlight ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-[#f5b870]/25 rounded-full blur-[160px] pointer-events-none" />

      {/* Mobile Top Pin Thought Quick Action */}
      {onNewNote && (
        <button
          type="button"
          onClick={onNewNote}
          className="
            md:hidden flex items-center justify-center gap-1.5 px-4 py-2 rounded-full
            bg-[#fefaf2] text-[#2c1d11] border-2 border-[#8a502c] shadow-md
            hover:bg-[#fff7ea] active:scale-95 transition-all cursor-pointer font-serif font-bold text-xs mb-3 z-20
          "
        >
          <FaFeatherAlt size={11} className="text-[#844f2e]" />
          <span>+ Pin Thought</span>
        </button>
      )}

      {/* 
        ===========================================================
        DESKTOP INTERFACE: OPTION B (Hardcover Two-Page Bound Spread)
        ===========================================================
      */}
      <div
        className={`
          hidden md:flex relative w-full max-w-[1340px] h-[780px]
          bg-[#784628] rounded-3xl p-3 shadow-[0_25px_60px_rgba(60,30,10,0.35),_0_5px_15px_rgba(0,0,0,0.15)]
          border-4 border-[#562f17] perspective-container z-10 transition-transform duration-300
          ${flippingLeaf?.direction === "next" ? "scale-[0.995] [transform:rotateY(-1deg)]" : ""}
          ${flippingLeaf?.direction === "prev" ? "scale-[0.995] [transform:rotateY(1deg)]" : ""}
        `}
      >
        {/* Floating Quick-Pin Quill Action Button on Desk/Cover */}
        {onNewNote && (
          <button
            type="button"
            onClick={onNewNote}
            className="
              hidden md:flex items-center gap-2 px-4 py-2 rounded-full
              bg-[#fefaf2] text-[#2c1d11] border-2 border-[#8a502c] shadow-[0_4px_16px_rgba(40,20,10,0.25)]
              hover:bg-[#fff7ea] hover:scale-105 active:scale-95 transition-all cursor-pointer font-serif font-bold text-xs
              absolute -top-4 right-8 z-40
            "
            title="Pin a new thought anytime"
          >
            <FaFeatherAlt size={13} className="text-[#844f2e]" />
            <span>+ Pin Thought</span>
          </button>
        )}

        {/* Book Outer Leather Rim & Edge Pages Thickness */}
        <div className="absolute -inset-1 rounded-[26px] border border-[#9c5f37]/50 pointer-events-none opacity-60" />

        {/* Bookmark Ribbon hanging down center bottom */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-7 h-16 bg-[#8a2f24] shadow-xl z-30 rounded-b-sm border-x border-[#611a12]">
          <div className="absolute bottom-0 left-0 right-0 h-3.5 bg-[#ebdcc9] [clip-path:polygon(0_100%,_50%_0,_100%_100%)]" />
        </div>

        {/* 
          ---------------------------------------
          LEFT PAGE (Spread Page 2N - 1)
          ---------------------------------------
        */}
        <div className="relative flex-1 h-full flex flex-col">
          {renderDesktopPageContent(
            flippingLeaf
              ? flippingLeaf.direction === "next"
                ? flippingLeaf.fromSpread
                : flippingLeaf.toSpread
              : activeSpreadIndex,
            "left",
            flippingLeaf === null
          )}
          {/* Dynamic incoming shadow on destination leaf */}
          {flippingLeaf?.direction === "next" && (
            <div className="absolute inset-0 bg-[#3a1d0d]/10 rounded-l-2xl pointer-events-none transition-opacity duration-500 z-30" />
          )}
        </div>

        {/* 
          ---------------------------------------
          CENTER SPINE SEAM
          ---------------------------------------
        */}
        <div className="w-2.5 h-full bg-gradient-to-r from-[#4d2813] via-[#784628] to-[#4d2813] shadow-[inset_0_0_8px_rgba(30,15,5,0.7)] z-20" />

        {/* 
          ---------------------------------------
          RIGHT PAGE (Spread Page 2N)
          ---------------------------------------
        */}
        <div className="relative flex-1 h-full flex flex-col">
          {renderDesktopPageContent(
            flippingLeaf
              ? flippingLeaf.direction === "next"
                ? flippingLeaf.toSpread
                : flippingLeaf.fromSpread
              : activeSpreadIndex,
            "right",
            flippingLeaf === null
          )}
          {/* Dynamic incoming shadow on destination leaf */}
          {flippingLeaf?.direction === "prev" && (
            <div className="absolute inset-0 bg-[#3a1d0d]/10 rounded-r-2xl pointer-events-none transition-opacity duration-500 z-30" />
          )}
        </div>

        {/* 
          -------------------------------------------------------------
          3D FLIPPING PAGE LEAF (Authentic Physical Page Turn)
          -------------------------------------------------------------
        */}
        {flippingLeaf && (
          <div
            className={`
              absolute top-3 bottom-3 z-40 pointer-events-none preserve-3d
              ${
                flippingLeaf.direction === "next"
                  ? "left-1/2 right-3 origin-left animate-page-turn-next"
                  : "left-3 right-1/2 origin-right animate-page-turn-prev"
              }
            `}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* FRONT FACE (Peels up from active page) */}
            <div className="absolute inset-0 backface-hidden overflow-hidden rounded-2xl shadow-2xl">
              {renderDesktopPageContent(
                flippingLeaf.fromSpread,
                flippingLeaf.direction === "next" ? "right" : "left",
                false
              )}
            </div>

            {/* BACK FACE (Rotated 180deg, lands on opposite side) */}
            <div
              className="absolute inset-0 backface-hidden overflow-hidden rounded-2xl shadow-2xl"
              style={{ transform: "rotateY(180deg)" }}
            >
              {renderDesktopPageContent(
                flippingLeaf.toSpread,
                flippingLeaf.direction === "next" ? "left" : "right",
                false
              )}
            </div>
          </div>
        )}
      </div>

      {/* 
        ===========================================================
        MOBILE INTERFACE: OPTION A (Top-Spiral Reporter Wire Notepad)
        ===========================================================
      */}
      <div className="md:hidden relative w-full max-w-[420px] bg-[#784628] rounded-2xl pt-6 pb-4 px-3 shadow-2xl border-4 border-[#562f17] z-10 flex flex-col perspective-container">
        {/* Top Wire Spiral Loops */}
        <div className="absolute -top-4 left-0 right-0 flex justify-evenly px-4 z-30 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="wire-spiral-ring"
            />
          ))}
        </div>

        {/* The Notepad Page Wrapper */}
        <div className="relative overflow-hidden bg-parchment rounded-xl p-4 flex flex-col min-h-[580px] shadow-inner">
          {/* Stationary Underlying Mobile Page */}
          {renderMobilePageContent(
            mobileFlip
              ? mobileFlip.direction === "next"
                ? mobileFlip.toPage
                : mobileFlip.fromPage
              : activeMobilePageIndex,
            mobileFlip === null
          )}

          {/* Animated Mobile Turning Leaf */}
          {mobileFlip && (
            <div
              className={`absolute inset-0 z-20 bg-parchment rounded-xl p-4 flex flex-col justify-between shadow-2xl pointer-events-none ${
                mobileFlip.direction === "next"
                  ? "animate-notepad-turn-next"
                  : "animate-notepad-turn-prev"
              }`}
            >
              {renderMobilePageContent(
                mobileFlip.direction === "next" ? mobileFlip.fromPage : mobileFlip.toPage,
                false
              )}
            </div>
          )}
        </div>

        {/* Mobile Page Controls */}
        <div className="flex justify-between items-center mt-3 px-2 text-xs font-serif text-[#fefaf2]">
          <button
            type="button"
            disabled={totalMobilePages <= 1 || activeMobilePageIndex === 0}
            onClick={handlePrevMobilePage}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#5e341b] border border-[#9c633e]/50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:bg-[#784628]"
          >
            <FaChevronLeft size={10} />
            <span>Prev Page</span>
          </button>

          <span className="text-[11px] font-sans text-[#fefaf2] font-bold">
            Page {activeMobilePageIndex + 1}
          </span>

          <button
            type="button"
            disabled={totalMobilePages <= 1 || activeMobilePageIndex >= totalMobilePages - 1}
            onClick={handleNextMobilePage}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#5e341b] border border-[#9c633e]/50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:bg-[#784628]"
          >
            <span>Next Page</span>
            <FaChevronRight size={10} />
          </button>
        </div>
      </div>

      {/* 
        ===========================================================
        DESKTOP NAVIGATION BAR (Under the notebook spread)
        ===========================================================
      */}
      <div className="hidden md:flex items-center justify-between w-full max-w-[1340px] mt-4 px-4 text-xs font-serif text-[#4d2f1b] z-20">
        <button
          type="button"
          disabled={totalSpreads <= 1 || activeSpreadIndex === 0}
          onClick={handlePrevSpread}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#784628] text-[#fefaf2] border border-[#562f17] hover:bg-[#8d5431] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
        >
          <FaChevronLeft size={12} />
          <span>Previous Spread</span>
        </button>

        <div className="flex items-center gap-4 font-sans text-[11px] text-[#5e3b22] tracking-wider uppercase font-semibold">
          <span>Drag edge or press <kbd className="px-1.5 py-0.5 rounded bg-[#fdf6ed] text-[#4d2f1a] border border-[#d6beaa] shadow-xs">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[#fdf6ed] text-[#4d2f1a] border border-[#d6beaa] shadow-xs">→</kbd></span>
          <span>•</span>
          {onNewNote && (
            <button
              type="button"
              onClick={onNewNote}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2e1d11] text-[#fdebd9] border border-[#562f17] hover:bg-[#3f2717] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm font-serif font-bold text-xs lowercase"
            >
              <FaFeatherAlt size={10} className="text-[#f5d5b8]" />
              <span className="capitalize">+ Pin Thought</span>
            </button>
          )}
          <span>•</span>
          <span>Spread {activeSpreadIndex + 1}</span>
        </div>

        <button
          type="button"
          disabled={totalSpreads <= 1 || activeSpreadIndex >= totalSpreads - 1}
          onClick={handleNextSpread}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#784628] text-[#fefaf2] border border-[#562f17] hover:bg-[#8d5431] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
        >
          <span>Next Spread</span>
          <FaChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
