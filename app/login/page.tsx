import ClosedNotebookCover from "@/components/auth/ClosedNotebookCover";

export default function LoginPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-desk text-[#241810] flex flex-col lg:flex-row items-stretch p-3.5 gap-4 relative select-none">
      {/* Golden evening sunlight radial ambient beam */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#f5b870]/25 rounded-full blur-[140px] pointer-events-none" />

      {/* LEFT HALF: Atmospheric Typography, Quotes & Essence */}
      <div className="w-full lg:w-[46%] xl:w-[42%] h-full flex flex-col justify-center px-6 md:px-10 lg:px-12 z-10 overflow-y-auto scrollbar-none">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#c4a284] bg-[#fbf3e6]/80 text-[#754425] text-xs font-serif tracking-widest uppercase mb-6 backdrop-blur-sm shadow-sm w-fit">
          <span>•</span>
          <span>Sign In to Pages</span>
          <span>•</span>
        </div>

        <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif tracking-tight text-[#2c1a0e] mb-5 leading-[1.05] drop-shadow-sm font-black">
          Inkless
        </h1>

        <p className="text-xl md:text-2xl font-serif italic text-[#6e462a] mb-6 leading-relaxed">
          &ldquo;Open the ledger where raw thoughts sit safely on parchment.&rdquo;
        </p>

        <div className="space-y-3 border-l-2 border-[#b89578] pl-5 my-6">
          <p className="font-handwriting text-2xl md:text-3xl text-[#3b2313] leading-snug font-bold">
            Each leaf holds thoughts that breathe for six hours. Turn the page, write what is unsaid, and leave no trace behind.
          </p>
        </div>
      </div>

      {/* RIGHT HALF: Grand Screen-Filling Closed Notebook (14px border gap) */}
      <div className="w-full lg:flex-1 h-full flex items-stretch z-10 relative">
        <ClosedNotebookCover initialMode="login" />
      </div>
    </main>
  );
}
