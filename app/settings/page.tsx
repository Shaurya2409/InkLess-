import Link from "next/link";
import { FaArrowLeft, FaSlidersH } from "react-icons/fa";

export default function SettingsPage() {
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

      <div className="bg-[#faf7f0] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-[#d6cbba] p-8 w-[450px] relative z-10 text-center text-[#24211e]">
        {/* Washi tape strip at top center */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#e2d4bd]/80 washi-tape pointer-events-none" />

        <div className="text-3xl mb-1 text-[#786c5e]">
          <FaSlidersH className="inline-block" />
        </div>

        <h1 className="text-3xl mb-2 text-[#1e1b18] font-serif tracking-tight">
          Desk Settings
        </h1>

        <p className="font-serif italic text-sm text-[#786c5e] mb-6">
          Reading preferences and ambient controls.
        </p>

        <div className="space-y-3 font-sans text-sm text-left mb-8">
          <div className="bg-[#f3eee3] p-3.5 rounded-xl border border-[#ded5c5] flex items-center justify-between">
            <div>
              <span className="block font-semibold text-[#24211e]">Quiet Notifications</span>
              <span className="text-xs text-[#786c5e]">Only alert when followed authors write</span>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#423a31]" />
          </div>

          <div className="bg-[#f3eee3] p-3.5 rounded-xl border border-[#ded5c5] flex items-center justify-between">
            <div>
              <span className="block font-semibold text-[#24211e]">Ambient Night Desk</span>
              <span className="text-xs text-[#786c5e]">Darker parchment and warm tone</span>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#423a31]" />
          </div>
        </div>

        <Link
          href="/wall"
          className="block w-full py-2.5 rounded-xl bg-[#2b2621] text-[#f4efe4] font-serif text-sm border border-[#141210] hover:bg-[#38312b] transition-all duration-150 text-center cursor-pointer shadow-md"
        >
          Return to Ledger
        </Link>
      </div>
    </main>
  );
}
