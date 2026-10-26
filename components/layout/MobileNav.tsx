"use client";

import { useEffect, useState } from "react";
import { FaBookOpen, FaFeatherAlt, FaUsers, FaUser } from "react-icons/fa";
import Link from "next/link";

type MobileNavProps = {
  onNewNote?: () => void;
};

export default function MobileNav({ onNewNote }: MobileNavProps) {
  const [requestCount, setRequestCount] = useState(0);

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
        // silent fail
      }
    }

    checkPendingRequests();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      className="
        fixed bottom-0 left-0 w-full h-18
        bg-[#784628] text-[#fefaf2]
        flex items-center justify-around lg:hidden
        border-t-2 border-[#562f17]
        z-50 pb-2 shadow-[0_-4px_20px_rgba(50,25,10,0.3)]
      "
    >
      <Link href="/wall" className="flex flex-col items-center gap-1 hover:text-[#ffd6a5] active:scale-90 transition-all">
        <FaBookOpen size={18} />
        <span className="text-[10px] font-sans tracking-wider">Pages</span>
      </Link>
      
      <button
        onClick={onNewNote}
        className="flex flex-col items-center gap-1 hover:text-[#ffd6a5] active:scale-90 transition-all cursor-pointer"
        title="Pin thought"
      >
        <div className="bg-[#fefaf2] p-3 rounded-full mt-[-22px] border-2 border-[#562f17] shadow-[0_4px_14px_rgba(50,25,10,0.35)] text-[#784628]">
          <FaFeatherAlt size={16} />
        </div>
      </button>

      <Link href="/staff" className="relative flex flex-col items-center gap-1 hover:text-[#ffd6a5] active:scale-90 transition-all">
        <div className="relative">
          <FaUsers size={18} />
          {requestCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-[#f39c12] rounded-full ring-2 ring-[#784628] animate-pulse" />
          )}
        </div>
        <span className="text-[10px] font-sans tracking-wider">Readers</span>
      </Link>
      
      <Link href="/profile" className="flex flex-col items-center gap-1 hover:text-[#ffd6a5] active:scale-90 transition-all">
        <FaUser size={18} />
        <span className="text-[10px] font-sans tracking-wider">Dossier</span>
      </Link>
    </div>
  );
}
