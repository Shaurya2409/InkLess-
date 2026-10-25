"use client";

import { useState } from "react";
import { ATELIER_THEMES, AtelierTheme } from "@/lib/stationeryThemes";
import { FastenerRenderer } from "./StickyFasteners";

type NewNoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPost: () => void;
};

export default function NewNoteModal({
  isOpen,
  onClose,
  onPost,
}: NewNoteModalProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<AtelierTheme>(
    ATELIER_THEMES[0]
  );

  const MAX_CHARS = 70;

  if (!isOpen) return null;

  const handlePost = async () => {
    const trimmed = text.trim();

    if (!trimmed) {
      alert("Note cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/notes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to pin note.");
        return;
      }

      setText("");
      onClose();
      onPost();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2a170a]/65 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease]">
      <div
        className={`
          ${selectedTheme.paperBg} ${selectedTheme.paperBorder}
          w-full max-w-[430px] rounded-[4px] p-6 border-[2px]
          pixar-paper-shadow relative animate-[scaleIn_0.2s_ease] transition-colors duration-200
        `}
        style={
          selectedTheme.gridOverlay
            ? {
                backgroundImage: selectedTheme.gridOverlay,
                backgroundSize: "14px 14px",
              }
            : undefined
        }
      >
        {/* Dynamic Fastener (Brass clip, kraft tape, draft tape, or animation peg holes) */}
        <FastenerRenderer
          fastener={selectedTheme.fastener}
          position="center"
        />

        {/* Torn top edge fiber */}
        <div className="absolute top-0 left-0 right-0 h-[2px] torn-edge-fiber text-[#2a2219]/25 pointer-events-none" />

        {/* Header: Title & Accent Badge */}
        <div className="flex justify-between items-center mb-4 pt-1 border-b border-[#2a2219]/15 pb-2">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-[#736352] font-mono block">
              ATELIER DESK // NOTEBOOK
            </span>
            <h2 className="text-xl font-serif font-black tracking-tight text-[#221a12]">
              Pin a Thought
            </h2>
          </div>
          <span className={selectedTheme.accentBadge.style}>
            {selectedTheme.accentBadge.text}
          </span>
        </div>

        {/* Atelier Theme Swatch Picker (Gender-neutral paper selector) */}
        <div className="mb-3.5">
          <label className="text-[9px] font-mono uppercase tracking-wider text-[#685a49] block mb-1.5 font-bold">
            Paper Archetype
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {ATELIER_THEMES.map((t) => {
              const isSelected = t.id === selectedTheme.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTheme(t)}
                  className={`
                    px-2.5 py-1 rounded-[3px] text-[10px] font-mono tracking-tight transition-all border
                    ${
                      isSelected
                        ? "bg-[#251d15] text-[#f7eedc] border-[#251d15] shadow-sm scale-105 font-bold"
                        : "bg-black/5 text-[#4e4133] border-[#2a2219]/20 hover:bg-black/10"
                    }
                    cursor-pointer whitespace-nowrap
                  `}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Composer Textarea with Authentic Ink */}
        <textarea
          value={text}
          maxLength={MAX_CHARS}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write down a spontaneous thought or observation..."
          autoFocus
          className={`
            w-full h-32 resize-none rounded-[3px] p-3.5 outline-none 
            bg-white/60 border border-[#2a2219]/20 shadow-inner
            font-handwriting text-2xl font-bold leading-tight ${selectedTheme.inkColor}
            placeholder:text-[#91816f] focus:border-[#2a2219] focus:bg-white/80
            transition-all
          `}
        />

        {/* Footer: Ephemeral Note Indicator & Character Counter */}
        <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-[#6e5d4a]">
          <span className="font-semibold tracking-wider">
            24H EPHEMERAL INK
          </span>
          <span className="font-bold">
            {text.length}/{MAX_CHARS}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 mt-5">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="
              flex-1 py-2 rounded-[3px] text-xs font-mono font-semibold
              bg-[#ece4d6] text-[#3d3327] border border-[#2a2219]/20
              hover:bg-[#ded4c3] active:scale-[0.98] transition-all cursor-pointer
            "
          >
            DISCARD
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handlePost}
            className="
              flex-1 py-2 rounded-[3px] text-xs font-mono font-bold tracking-wider uppercase
              bg-[#241c14] text-[#faf5ea] border border-[#17110c]
              hover:bg-[#382c20] active:scale-[0.98] transition-all
              disabled:opacity-50 cursor-pointer shadow-sm
            "
          >
            {loading ? "INKING..." : "PIN TO LEAF"}
          </button>
        </div>
      </div>
    </div>
  );
}
