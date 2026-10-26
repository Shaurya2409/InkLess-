"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaSearch,
  FaTimes,
  FaSpinner,
  FaUsers,
  FaFeatherAlt,
  FaUserCheck,
  FaUserPlus,
  FaHourglassHalf,
} from "react-icons/fa";

export type CompanionUser = {
  id: string;
  username: string;
  isFollowing: boolean;
  relationship: "following" | "requested" | "none";
  followersCount: number;
  followingCount: number;
  thoughtsCount: number;
};

type CompanionSearchProps = {
  onFollowChange?: () => void;
  placeholder?: string;
  className?: string;
};

export default function CompanionSearch({
  onFollowChange,
  placeholder = "Search companions by Pen Name / ID...",
  className = "",
}: CompanionSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanionUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecommendation, setIsRecommendation] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUsers = useCallback(async (searchQuery: string) => {
    try {
      setLoading(true);
      const url = searchQuery.trim()
        ? `/api/users/search?q=${encodeURIComponent(searchQuery.trim())}`
        : `/api/users/search`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setResults(data.users || []);
        setIsRecommendation(Boolean(data.isRecommendation));
      }
    } catch (err) {
      console.error("Failed to search companions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load: show recommended companions
  useEffect(() => {
    let active = true;

    async function loadInitial() {
      try {
        const res = await fetch("/api/users/search");
        const data = await res.json();
        if (active && data.success) {
          setResults(data.users || []);
          setIsRecommendation(Boolean(data.isRecommendation));
        }
      } catch (err) {
        if (active) console.error("Failed to load initial companions:", err);
      }
    }

    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  // Debounced search on query change
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchUsers(val);
    }, 220);
  };

  const handleClear = () => {
    setQuery("");
    fetchUsers("");
  };

  const handleAction = async (user: CompanionUser) => {
    const rel = user.relationship || (user.isFollowing ? "following" : "none");

    if (rel === "following") {
      if (!confirm(`Unsubscribe from companion @${user.username}?`)) return;

      // Optimistic update
      setResults((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                relationship: "none",
                isFollowing: false,
                followersCount: Math.max(0, u.followersCount - 1),
              }
            : u
        )
      );

      try {
        setActionLoadingId(user.id);
        const res = await fetch("/api/follow/unfollow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId: user.id }),
        });
        const data = await res.json();
        if (!data.success) {
          // Revert
          setResults((prev) =>
            prev.map((u) => (u.id === user.id ? user : u))
          );
          alert(data.message || "Failed to unfollow.");
        } else if (onFollowChange) {
          onFollowChange();
        }
      } catch (err) {
        console.error(err);
        setResults((prev) =>
          prev.map((u) => (u.id === user.id ? user : u))
        );
      } finally {
        setActionLoadingId(null);
      }
    } else if (rel === "requested") {
      if (!confirm(`Cancel companion request to @${user.username}?`)) return;

      // Optimistic update
      setResults((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, relationship: "none" } : u
        )
      );

      try {
        setActionLoadingId(user.id);
        const res = await fetch("/api/follow/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId: user.id }),
        });
        const data = await res.json();
        if (!data.success) {
          setResults((prev) =>
            prev.map((u) => (u.id === user.id ? user : u))
          );
          alert(data.message || "Failed to cancel request.");
        } else if (onFollowChange) {
          onFollowChange();
        }
      } catch (err) {
        console.error(err);
        setResults((prev) =>
          prev.map((u) => (u.id === user.id ? user : u))
        );
      } finally {
        setActionLoadingId(null);
      }
    } else {
      // Send companion request
      setResults((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, relationship: "requested" } : u
        )
      );

      try {
        setActionLoadingId(user.id);
        const res = await fetch("/api/follow/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId: user.id }),
        });
        const data = await res.json();
        if (!data.success) {
          setResults((prev) =>
            prev.map((u) => (u.id === user.id ? user : u))
          );
          alert(data.message || "Failed to send request.");
        } else if (onFollowChange) {
          onFollowChange();
        }
      } catch (err) {
        console.error(err);
        setResults((prev) =>
          prev.map((u) => (u.id === user.id ? user : u))
        );
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  return (
    <div className={`w-full flex flex-col font-sans ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center w-full">
        <div className="absolute left-3.5 text-[#8c7b6c] pointer-events-none flex items-center justify-center">
          <FaSearch size={14} />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full pl-10 pr-10 py-2.5 rounded-xl text-sm font-sans
            bg-[#fdfaf3] text-[#24211e] placeholder-[#9c8e7e]
            border border-[#cfc4b4] shadow-xs
            focus:outline-none focus:ring-2 focus:ring-[#784628]/30 focus:border-[#784628]
            transition-all
          "
        />

        {/* Clear or Spinner Indicator */}
        <div className="absolute right-3.5 flex items-center">
          {loading ? (
            <FaSpinner size={13} className="text-[#8c7b6c] animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-[#9c8e7e] hover:text-[#382f25] p-1 cursor-pointer transition-colors"
              title="Clear search"
            >
              <FaTimes size={13} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Recommendations & Results Tray */}
      <div className="mt-3 w-full">
        {/* Tray Header */}
        <div className="flex items-center justify-between pb-1.5 px-1 border-b border-[#e2d8c7] mb-2 text-xs font-serif text-[#786c5e]">
          <span className="italic">
            {isRecommendation
              ? "Suggested Authors & Companions"
              : `Suggestions matching "${query}"`}
          </span>
          <span className="text-[11px] font-sans text-[#a89b88]">
            {results.length} {results.length === 1 ? "match" : "matches"}
          </span>
        </div>

        {/* Results List */}
        {results.length === 0 && !loading ? (
          <div className="py-6 px-4 rounded-xl bg-[#f5efe2] border border-dashed border-[#dcd3c1] text-center">
            <p className="font-serif italic text-sm text-[#786c5e]">
              No companions found with ID &ldquo;{query}&rdquo;.
            </p>
            <p className="text-xs text-[#a89b88] mt-1 font-sans">
              Try searching a partial name or check for typos.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {results.map((user) => {
              const isLoadingThis = actionLoadingId === user.id;
              const rel = user.relationship || (user.isFollowing ? "following" : "none");

              return (
                <div
                  key={user.id}
                  className="
                    bg-[#fbf7ee] p-3 rounded-xl border border-[#ded5c5]
                    flex items-center justify-between gap-3
                    hover:bg-[#f5efe2] transition-colors
                  "
                >
                  {/* Left: Avatar & User Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 shrink-0 rounded-full bg-[#eee5d5] border border-[#cfc4b4] flex items-center justify-center text-xs font-serif font-black text-[#5c5245]">
                      {user.username.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="font-serif font-bold text-sm text-[#1e1b18] truncate">
                        @{user.username}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#786c5e] font-sans truncate">
                        <span className="inline-flex items-center gap-1">
                          <FaUsers size={10} className="text-[#a89b88]" />
                          {user.followersCount} {user.followersCount === 1 ? "reader" : "readers"}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <FaFeatherAlt size={9} className="text-[#a89b88]" />
                          {user.thoughtsCount} {user.thoughtsCount === 1 ? "thought" : "thoughts"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Request State Button */}
                  <button
                    type="button"
                    disabled={isLoadingThis}
                    onClick={() => handleAction(user)}
                    className={`
                      shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif font-semibold
                      transition-all cursor-pointer shadow-xs disabled:opacity-50
                      ${
                        rel === "following"
                          ? "bg-[#efe8d8] text-[#5c5245] border border-[#cfc4b4] hover:bg-[#e4dcce] hover:text-[#2c251e]"
                          : rel === "requested"
                          ? "bg-[#ecd5ad] text-[#6b4516] border border-[#cb9f64] hover:bg-[#e0c294]"
                          : "bg-[#784628] text-[#fefaf2] border border-[#562f17] hover:bg-[#8d5431]"
                      }
                    `}
                    title={
                      rel === "following"
                        ? "Subscribed companion. Click to unfollow."
                        : rel === "requested"
                        ? "Request pending approval. Click to cancel."
                        : "Send companion follow request."
                    }
                  >
                    {isLoadingThis ? (
                      <FaSpinner size={10} className="animate-spin" />
                    ) : rel === "following" ? (
                      <>
                        <FaUserCheck size={11} className="text-[#5c5245]" />
                        <span>Subscribed</span>
                      </>
                    ) : rel === "requested" ? (
                      <>
                        <FaHourglassHalf size={10} className="text-[#875519] animate-pulse" />
                        <span>Requested</span>
                      </>
                    ) : (
                      <>
                        <FaUserPlus size={11} className="text-[#f5d5b8]" />
                        <span>+ Follow</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
