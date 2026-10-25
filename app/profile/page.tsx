"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaChevronRight, FaFeatherAlt } from "react-icons/fa";

type Profile = {
  username: string;
  email: string;
  followers: number;
  following: number;
  hiddenNotes: number;
  totalNotes: number;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const res = await fetch("/api/profile/get");
        const data = await res.json();
        if (!cancelled && data.success) setProfile(data.profile);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = async () => {
    await fetch("/api/profile/logout", { method: "POST" });
    router.push("/login");
  };

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-desk font-serif text-xl text-[#c7b59e]">
        Opening Author Dossier...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-desk flex justify-center items-center p-6 relative overflow-hidden">
      {/* Top Back Button */}
      <Link
        href="/wall"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 bg-[#784628] text-[#fefaf2] px-4 py-2.5 rounded-xl font-serif text-sm border border-[#562f17] shadow-[0_4px_14px_rgba(50,25,10,0.3)] hover:bg-[#8d5431] transition-all"
        title="Return to The Pages"
      >
        <FaArrowLeft size={14} className="text-[#f5d5b8]" />
        <span>Back to Pages</span>
      </Link>

      <div className="bg-[#faf7f0] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-[#d6cbba] p-8 w-[500px] relative z-10 text-[#24211e]">
        {/* Washi tape strip at top center */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#e2d4bd]/80 washi-tape pointer-events-none" />

        <div className="text-center text-3xl mb-1 text-[#786c5e]">
          <FaFeatherAlt className="inline-block" />
        </div>

        <h1 className="text-3xl text-center mb-6 text-[#1e1b18] font-serif tracking-tight">
          Author Dossier
        </h1>

        <div className="space-y-3.5 text-sm font-sans">
          <div className="bg-[#f3eee3] p-3.5 rounded-xl border border-[#ded5c5] flex justify-between">
            <span className="font-semibold text-[#6e6357]">Pen Name:</span>{" "}
            <span className="font-serif font-bold text-[#1e1b18]">@{profile.username}</span>
          </div>

          <div className="bg-[#f3eee3] p-3.5 rounded-xl border border-[#ded5c5] flex justify-between">
            <span className="font-semibold text-[#6e6357]">Registered Email:</span>{" "}
            <span className="truncate max-w-[200px] text-[#423c34]">{profile.email}</span>
          </div>

          {/* Click to redirect to staff page (followers tab) */}
          <button
            onClick={() => router.push("/staff?tab=followers")}
            className="w-full bg-[#f3eee3] p-3.5 rounded-xl border border-[#ded5c5] flex justify-between items-center cursor-pointer hover:bg-[#ece4d4] transition-colors group"
          >
            <span className="font-semibold text-[#6e6357]">Readers & Followers</span>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-[#24211e]">({profile.followers})</span>
              <FaChevronRight size={12} className="text-[#8c7f70] group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Click to redirect to staff page (following tab) */}
          <button
            onClick={() => router.push("/staff?tab=following")}
            className="w-full bg-[#f3eee3] p-3.5 rounded-xl border border-[#ded5c5] flex justify-between items-center cursor-pointer hover:bg-[#ece4d4] transition-colors group"
          >
            <span className="font-semibold text-[#6e6357]">Followed Authors</span>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-[#24211e]">({profile.following})</span>
              <FaChevronRight size={12} className="text-[#8c7f70] group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-[#f3eee3] p-3.5 rounded-xl border border-[#ded5c5] text-center">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[#6e6357]">Active Thoughts</div>
              <div className="text-2xl font-serif font-bold text-[#1e1b18] mt-0.5">{profile.totalNotes}</div>
            </div>
            <div className="bg-[#f3eee3] p-3.5 rounded-xl border border-[#ded5c5] text-center">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[#6e6357]">Archived Leaves</div>
              <div className="text-2xl font-serif font-bold text-[#786c5e] mt-0.5">{profile.hiddenNotes}</div>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full mt-6 py-2.5 rounded-xl bg-[#2b2621] text-[#f4efe4] font-serif text-sm tracking-wide border border-[#141210] hover:bg-[#3b342d] transition-all cursor-pointer shadow-md"
        >
          Close Ledger (Sign Out)
        </button>
      </div>
    </main>
  );
}
