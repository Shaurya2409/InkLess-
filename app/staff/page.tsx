"use client";

import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaUsers, FaUserCheck, FaSortAmountDown, FaClock, FaFeatherAlt, FaSearch } from "react-icons/fa";

import CompanionSearch from "@/components/companions/CompanionSearch";

type StaffMember = {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  recipeCount: number;
  followIndex: number;
};

type SortOption = "latest" | "earliest" | "most_active" | "least_active";

function StaffContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "following" ? "following" : "followers";

  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [followers, setFollowers] = useState<StaffMember[]>([]);
  const [following, setFollowing] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const reloadStaff = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchStaff() {
      try {
        const res = await fetch("/api/follow/list");
        const data = await res.json();
        if (active && data.success) {
          setFollowers(data.followers || []);
          setFollowing(data.following || []);
        }
      } catch (err) {
        if (active) console.error("Failed to load companion list:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchStaff();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const handleUnfollow = async (targetUserId: string, username: string) => {
    if (!confirm(`Unsubscribe from author @${username}?`)) return;

    try {
      setActionLoading(targetUserId);
      const res = await fetch("/api/follow/unfollow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      const data = await res.json();
      if (data.success) {
        setFollowing((prev) => prev.filter((u) => u._id !== targetUserId));
      } else {
        alert(data.message || "Failed to unfollow");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const currentList = activeTab === "followers" ? followers : following;

  const sortedList = useMemo(() => {
    const list = [...currentList];
    switch (sortOption) {
      case "latest":
        return list.sort((a, b) => b.followIndex - a.followIndex);
      case "earliest":
        return list.sort((a, b) => a.followIndex - b.followIndex);
      case "most_active":
        return list.sort((a, b) => b.recipeCount - a.recipeCount);
      case "least_active":
        return list.sort((a, b) => a.recipeCount - b.recipeCount);
      default:
        return list;
    }
  }, [currentList, sortOption]);

  return (
    <main className="min-h-screen bg-desk flex flex-col items-center justify-start p-6 pt-24 relative overflow-hidden">
      {/* Top Back Button */}
      <Link
        href="/wall"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 bg-[#784628] text-[#fefaf2] px-4 py-2.5 rounded-xl font-serif text-sm border border-[#562f17] shadow-[0_4px_14px_rgba(50,25,10,0.3)] hover:bg-[#8d5431] transition-all"
        title="Return to The Pages"
      >
        <FaArrowLeft size={14} className="text-[#f5d5b8]" />
        <span>Back to Pages</span>
      </Link>

      {/* Main Container */}
      <div className="bg-[#faf7f0] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-[#d6cbba] p-8 w-full max-w-2xl relative z-10 mb-12 text-[#24211e]">
        {/* Washi tape strip at top center */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#e2d4bd]/80 washi-tape pointer-events-none" />

        <div className="text-center text-3xl mb-1 text-[#786c5e]">
          <FaUsers className="inline-block" />
        </div>

        <h1 className="text-3xl text-center mb-1 text-[#1e1b18] font-serif tracking-tight">
          Readers & Companions
        </h1>

        <p className="text-center font-serif italic text-sm text-[#786c5e] mb-6">
          Authors who read your leaf, and journals you subscribe to.
        </p>

        {/* Companion Search with Real-time Recommendations */}
        <div className="mb-8 p-4 rounded-2xl bg-[#f5eee0] border border-[#ded5c5] shadow-inner">
          <div className="flex items-center gap-2 text-sm font-serif font-bold text-[#382f25] mb-1">
            <FaSearch size={12} className="text-[#844f2e]" />
            <span>Discover & Follow Companions</span>
          </div>
          <p className="text-xs font-serif italic text-[#786c5e] mb-3">
            Search your friends&apos; pen names or explore recommended authors.
          </p>
          <CompanionSearch onFollowChange={reloadStaff} />
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6 font-sans text-sm">
          <button
            onClick={() => {
              setActiveTab("followers");
              router.replace("/staff?tab=followers");
            }}
            className={`py-2.5 px-4 rounded-xl border font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "followers"
                ? "bg-[#27231f] text-[#f4efe4] border-[#141210] shadow-md"
                : "bg-[#f3eee3] text-[#52493f] border-[#ded5c5] hover:bg-[#ece4d4]"
            }`}
          >
            <FaUsers size={16} />
            <span>Readers (Followers)</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "followers"
                  ? "bg-[#3d3731] text-[#f4efe4]"
                  : "bg-[#ded5c5] text-[#24211e]"
              }`}
            >
              {followers.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("following");
              router.replace("/staff?tab=following");
            }}
            className={`py-2.5 px-4 rounded-xl border font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "following"
                ? "bg-[#27231f] text-[#f4efe4] border-[#141210] shadow-md"
                : "bg-[#f3eee3] text-[#52493f] border-[#ded5c5] hover:bg-[#ece4d4]"
            }`}
          >
            <FaUserCheck size={16} />
            <span>Subscribed (Following)</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "following"
                  ? "bg-[#3d3731] text-[#f4efe4]"
                  : "bg-[#ded5c5] text-[#24211e]"
              }`}
            >
              {following.length}
            </span>
          </button>
        </div>

        {/* Sorting Dropdown */}
        <div className="bg-[#f3eee3] p-3.5 rounded-xl border border-[#ded5c5] mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center gap-2 text-[#423c34] font-medium">
            <FaSortAmountDown className="text-[#786c5e]" />
            <span>Sort by:</span>
          </div>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="w-full sm:w-auto bg-[#faf7f0] border border-[#cfc4b4] rounded-lg px-3 py-1.5 text-xs font-medium text-[#24211e] outline-none cursor-pointer"
          >
            <option value="latest">Latest Followed</option>
            <option value="earliest">Earliest Followed</option>
            <option value="most_active">Most Active (Most Thoughts)</option>
            <option value="least_active">Least Active (Fewest Thoughts)</option>
          </select>
        </div>

        {/* Authors List */}
        {loading ? (
          <div className="text-center py-12 text-[#786c5e] font-serif text-lg">
            Opening Ledger...
          </div>
        ) : sortedList.length === 0 ? (
          <div className="text-center py-12 bg-[#f3eee3] rounded-xl border border-dashed border-[#cfc4b4]">
            <p className="font-serif italic text-lg text-[#6e6357]">
              {activeTab === "followers"
                ? "No readers subscribed to your ledger yet."
                : "You haven't subscribed to any journals yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedList.map((author) => (
              <div
                key={author._id}
                className="bg-[#f8f5ee] p-3.5 rounded-xl border border-[#ded5c5] flex items-center justify-between hover:bg-[#f3eee3] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f0eae0] border border-[#cfc4b4] flex items-center justify-center text-sm font-serif font-bold text-[#5c5245]">
                    {author.username.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="font-serif font-bold text-base text-[#1e1b18]">
                      @{author.username}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-xs font-sans text-[#786c5e]">
                      <span className="inline-flex items-center gap-1">
                        <FaFeatherAlt size={9} />
                        {author.recipeCount} {author.recipeCount === 1 ? "thought" : "thoughts"}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <FaClock size={9} />
                        Sequence #{author.followIndex + 1}
                      </span>
                    </div>
                  </div>
                </div>

                {activeTab === "following" && (
                  <button
                    disabled={actionLoading === author._id}
                    onClick={() => handleUnfollow(author._id, author.username)}
                    className="px-3 py-1 rounded-lg bg-[#faf7f0] text-[#786c5e] hover:text-[#24211e] text-xs font-sans border border-[#cfc4b4] hover:bg-[#ede6d8] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading === author._id ? "..." : "Unfollow"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function StaffPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-desk flex items-center justify-center font-serif text-xl text-[#c7b59e]">
          Opening Ledger...
        </div>
      }
    >
      <StaffContent />
    </Suspense>
  );
}
