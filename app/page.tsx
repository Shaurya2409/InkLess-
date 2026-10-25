import ClosedNotebookCover from "@/components/auth/ClosedNotebookCover";

export default function LandingPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-desk text-[#241810] flex flex-col lg:flex-row items-stretch p-3.5 gap-4 relative select-none">
      {/* Golden evening sunlight radial ambient beam */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#f5b870]/25 rounded-full blur-[140px] pointer-events-none" />

      {/* 
        ====================================================
        LEFT HALF: Atmospheric Typography, Quotes & Essence
        ====================================================
      */}
      <div className="w-full lg:w-[46%] xl:w-[42%] h-full flex flex-col justify-center px-6 md:px-10 lg:px-12 z-10 overflow-y-auto scrollbar-none">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#c4a284] bg-[#fbf3e6]/80 text-[#754425] text-xs font-serif tracking-widest uppercase mb-6 backdrop-blur-sm shadow-sm w-fit">
          <span>•</span>
          <span>Ephemeral Journal</span>
          <span>•</span>
        </div>

        <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif tracking-tight text-[#2c1a0e] mb-5 leading-[1.05] drop-shadow-sm font-black">
          Inkless
        </h1>

        <p className="text-xl md:text-2xl font-serif italic text-[#6e462a] mb-6 leading-relaxed">
          &ldquo;Some thoughts are only meant to exist for a little while.&rdquo;
        </p>

        <div className="space-y-3 border-l-2 border-[#b89578] pl-5 my-6">
          <p className="font-handwriting text-2xl md:text-3xl text-[#3b2313] leading-snug font-bold">
            Pinned to paper in the quiet hours. No endless feeds. No algorithms. Just words written down and released before the ink fades.
          </p>
          <span className="block text-xs uppercase tracking-widest text-[#825b3e] font-sans font-bold">
            — The Living Ledger
          </span>
        </div>

        {/* Tactile Highlights in Warm Evening Sunlight */}
        <div className="grid grid-cols-3 gap-3 pt-3 text-xs font-sans text-[#634835]">
          <div className="bg-[#fcf6ec]/85 border border-[#d6c0ac] rounded-xl p-3.5 shadow-sm">
            <span className="block font-serif font-black text-[#2e190c] text-sm mb-0.5">6-Hour</span>
            <span>Ephemeral ink life</span>
          </div>
          <div className="bg-[#fcf6ec]/85 border border-[#d6c0ac] rounded-xl p-3.5 shadow-sm">
            <span className="block font-serif font-black text-[#2e190c] text-sm mb-0.5">Unindexed</span>
            <span>Zero personal footprints</span>
          </div>
          <div className="bg-[#fcf6ec]/85 border border-[#d6c0ac] rounded-xl p-3.5 shadow-sm">
            <span className="block font-serif font-black text-[#2e190c] text-sm mb-0.5">Slotted</span>
            <span>6 notes per leaf</span>
          </div>
        </div>
      </div>

      {/* 
        ====================================================
        RIGHT HALF: Grand Screen-Filling Closed Notebook
        ====================================================
      */}
      <div className="w-full lg:flex-1 h-full flex items-stretch z-10 relative">
        <ClosedNotebookCover initialMode="login" />
      </div>
    </main>
  );
}
