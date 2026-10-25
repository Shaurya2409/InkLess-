"use client";

import { FaBookOpen, FaFeatherAlt, FaUsers, FaUser } from "react-icons/fa";
import Link from "next/link";

type MobileNavProps = {
  onNewNote?: () => void;
};

export default function MobileNav({ onNewNote }: MobileNavProps) {
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
      >
        <div className="bg-[#fefaf2] p-3 rounded-full mt-[-22px] border-2 border-[#562f17] shadow-[0_4px_14px_rgba(50,25,10,0.35)] text-[#784628]">
          <FaFeatherAlt size={16} />
        </div>
      </button>

      <Link href="/staff" className="flex flex-col items-center gap-1 hover:text-[#ffd6a5] active:scale-90 transition-all">
        <FaUsers size={18} />
        <span className="text-[10px] font-sans tracking-wider">Readers</span>
      </Link>
      
      <Link href="/profile" className="flex flex-col items-center gap-1 hover:text-[#ffd6a5] active:scale-90 transition-all">
        <FaUser size={18} />
        <span className="text-[10px] font-sans tracking-wider">Dossier</span>
      </Link>
    </div>
  );
}
