"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import Wall from "@/components/wall/Wall";
import NewNoteModal from "@/components/wall/NewNoteModal";

type Note = {
  _id: string;
  text: string;
  createdAt: string;
  isOwner: boolean;
  author: {
    username: string;
  };
};

export default function WallPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/notes/get", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();

      if (data.success && Array.isArray(data.notes)) {
        setNotes(data.notes);
      }
    } catch (err) {
      console.error("Failed to load notes:", err);
    }
  }, [router]);

  // Initial load on mount
  useEffect(() => {
    let active = true;

    async function fetchInitialNotes() {
      try {
        const res = await fetch("/api/notes/get", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        if (active && data.success && Array.isArray(data.notes)) {
          setNotes(data.notes);
        }
      } catch (err) {
        if (active) {
          console.error("Failed to load initial notes:", err);
        }
      }
    }

    fetchInitialNotes();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen w-screen overflow-x-hidden bg-desk">
      <Sidebar onNewNote={() => setIsModalOpen(true)} />

      <Wall
        notes={notes}
        loadNotes={loadNotes}
        onNewNote={() => setIsModalOpen(true)}
      />

      <MobileNav onNewNote={() => setIsModalOpen(true)} />

      <NewNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPost={loadNotes}
      />
    </main>
  );
}
