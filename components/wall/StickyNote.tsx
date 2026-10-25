"use client";

import { useState, memo, useCallback, useMemo } from "react";
import { FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { getAtelierTheme } from "@/lib/stationeryThemes";
import { FastenerRenderer } from "./StickyFasteners";

type StickyNoteProps = {
  note: {
    _id: string;
    text: string;
    createdAt: string;
    isOwner: boolean;
    author: {
      username: string;
    };
  };
  slotIndex: number;
  onDelete: () => void;
  onUpdate?: () => void;
};

function StickyNote({
  note,
  slotIndex,
  onDelete,
  onUpdate,
}: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);
  const [isSaving, setIsSaving] = useState(false);

  // Deterministic Pixar Atelier Theme based on note ID
  const theme = useMemo(() => {
    return getAtelierTheme(note._id);
  }, [note._id]);

  const handleStartEdit = useCallback(() => {
    const tenMinutes = 10 * 60 * 1000;
    const isWithin10Minutes =
      Date.now() - new Date(note.createdAt).getTime() <= tenMinutes;

    if (!isWithin10Minutes) {
      alert("Notes can only be edited within 10 minutes of writing.");
      return;
    }
    setEditText(note.text);
    setIsEditing(true);
  }, [note.createdAt, note.text]);

  const handleSaveEdit = useCallback(async () => {
    const trimmed = editText.trim();
    if (!trimmed) {
      alert("Note cannot be empty.");
      return;
    }

    if (trimmed === note.text) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch("/api/notes/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note._id, text: trimmed }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsEditing(false);
        onUpdate?.();
      } else {
        alert(data.message || "Failed to update note.");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update note.");
    } finally {
      setIsSaving(false);
    }
  }, [editText, note._id, note.text, onUpdate]);

  const handleDelete = useCallback(async () => {
    if (!confirm("Tear out this note?")) return;

    try {
      const res = await fetch("/api/notes/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note._id }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onDelete();
      } else {
        alert(data.message || "Failed to remove note.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to remove note.");
    }
  }, [note._id, onDelete]);

  return (
    <div
      className={`
        paper-spring-card pixar-paper-shadow relative w-full h-full min-h-[148px] md:min-h-[162px] p-4 flex flex-col justify-between
        ${theme.paperBg} ${theme.paperBorder} ${theme.tiltAngle}
        border-[1.5px] rounded-[3px] group
      `}
      style={
        theme.gridOverlay
          ? {
              backgroundImage: theme.gridOverlay,
              backgroundSize: "14px 14px",
            }
          : undefined
      }
    >
      {/* Authentic Fastener (Brass Clip, Kraft Tape, Draft Tape, or Animation Peg Holes) */}
      <FastenerRenderer
        fastener={theme.fastener}
        position={theme.fastenerPosition}
      />

      {/* Torn Paper Deckled Fiber Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] torn-edge-fiber text-[#2a2219]/20 pointer-events-none" />

      {/* Header: Author & Atelier Identity / Controls */}
      <div className="flex justify-between items-center mb-1.5 border-b border-[#2a2219]/15 pb-1 z-10">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs font-serif tracking-wide ${
              note.isOwner
                ? "font-black text-[#2a2118]"
                : "italic font-semibold text-[#786c5e]"
            }`}
          >
            {note.isOwner ? `@${note.author?.username || "author"}` : "@anonymous"}
          </span>
          <span className={theme.accentBadge.style}>
            {theme.accentBadge.text}
          </span>
        </div>

        {note.isOwner ? (
          <div className="flex items-center gap-2 opacity-65 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleStartEdit}
              title="Edit note (within 10 mins)"
              className="text-[#4a3b2c] hover:text-[#1e1b18] hover:scale-125 transition-transform cursor-pointer"
            >
              <FaEdit size={12} />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              title="Tear out note"
              className="text-[#8c382e] hover:text-[#5e1e18] hover:scale-125 transition-transform cursor-pointer"
            >
              <FaTrash size={12} />
            </button>
          </div>
        ) : (
          <span className="text-[10px] font-mono text-[#8a7a67] tracking-tighter opacity-75">
            {theme.id === "storyboard" ? "⊕" : "••"}
          </span>
        )}
      </div>

      {/* Note Body: Editable or Text */}
      {isEditing ? (
        <div className="flex flex-col flex-1 mt-1 z-10">
          <textarea
            value={editText}
            maxLength={70}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSaveEdit();
              } else if (e.key === "Escape") {
                setIsEditing(false);
                setEditText(note.text);
              }
            }}
            autoFocus
            className={`
              w-full flex-1 min-h-[62px] resize-none bg-white/80 border border-[#b8a994] rounded p-2
              font-handwriting text-xl ${theme.inkColor} font-bold outline-none leading-tight shadow-inner
            `}
          />
          <div className="flex justify-between items-center mt-2 text-[10px] font-sans">
            <span className="text-[#6e6357]">{editText.length}/70</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setIsEditing(false);
                  setEditText(note.text);
                }}
                className="px-2 py-0.5 rounded bg-white text-[#24211e] border border-[#cfc4b4] hover:bg-[#ede6d8] flex items-center gap-1 active:scale-95 cursor-pointer font-medium"
              >
                <FaTimes size={9} /> Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveEdit}
                className="px-2 py-0.5 rounded bg-[#27231f] text-[#f4efe4] hover:bg-[#3d3731] flex items-center gap-1 active:scale-95 disabled:opacity-50 cursor-pointer font-medium"
              >
                <FaCheck size={9} /> {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p
          className={`
            font-handwriting text-xl md:text-2xl ${theme.inkColor} font-bold leading-snug flex-1 select-text break-words my-auto py-1 z-10
          `}
        >
          {note.text}
        </p>
      )}

      {/* Subtle Bottom Technical / Atelier Stamp */}
      <div className="flex justify-between items-center pt-1 border-t border-[#2a2219]/10 text-[9px] font-mono text-[#786c5e] tracking-wider uppercase z-10">
        <span className="font-bold">SLOT #{slotIndex + 1}</span>
        <span className="opacity-80">24H INK</span>
      </div>
    </div>
  );
}

export default memo(StickyNote);
