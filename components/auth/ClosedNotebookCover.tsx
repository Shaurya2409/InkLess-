"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

type ClosedNotebookCoverProps = {
  initialMode?: "login" | "signup";
};

export default function ClosedNotebookCover({
  initialMode = "login",
}: ClosedNotebookCoverProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [isOpening, setIsOpening] = useState(false);

  const handleAuthSuccess = () => {
    setIsOpening(true);
    setTimeout(() => {
      router.push("/wall");
    }, 900);
  };

  return (
    <div className="relative flex justify-center items-center w-full h-full perspective-container">
      {/* 
        ========================================
        MOBILE: TOP-SPIRAL WIRE COIL NOTEPAD (Option A)
        ========================================
      */}
      <div className="md:hidden absolute -top-5 left-0 right-0 flex justify-evenly px-6 z-30 pointer-events-none">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="wire-spiral-ring"
          />
        ))}
      </div>

      {/* 
        ========================================
        MAIN CLOSED NOTEBOOK COVER (Warm Cognac Saddle Leather)
        ========================================
      */}
      <div
        className={`
          relative w-full h-full min-h-[580px] rounded-2xl bg-[#7c4929] text-[#fefaf2]
          border-4 border-[#593118] shadow-[0_20px_50px_rgba(50,25,10,0.35),_0_2px_6px_rgba(0,0,0,0.2)]
          p-6 md:p-8 lg:p-10 transition-all duration-1000 origin-left flex flex-col justify-between
          ${
            isOpening
              ? "scale-105 opacity-0 [transform:rotateY(-115deg)_translateZ(60px)]"
              : "scale-100 opacity-100 [transform:rotateY(0deg)]"
          }
        `}
      >
        {/* Subtle Embossed Leather Border */}
        <div className="absolute inset-3 rounded-xl border border-[#a4653b]/60 pointer-events-none" />

        {/* Bookmark ribbon hanging off desktop bottom */}
        <div className="hidden md:block absolute -bottom-7 right-14 w-7 h-16 bg-[#8a2f24] shadow-xl rounded-b-sm border-x border-[#611a12] z-0">
          <div className="absolute bottom-0 left-0 right-0 h-3.5 bg-[#ebdcc9] [clip-path:polygon(0_100%,_50%_0,_100%_100%)]" />
        </div>

        {/* Notebook Cover Header */}
        <div className="text-center mb-3 relative z-10 pt-1">
          <div className="inline-block px-3 py-1 mb-2 text-[10px] uppercase tracking-[0.25em] text-[#f3dac2] bg-[#5a3219]/40 border border-[#a4653b]/40 rounded-full font-sans">
            Ephemeral Ledger
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-wider text-[#fff7ee] drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
            Inkless
          </h2>
          <p className="text-xs md:text-sm text-[#edd2ba] mt-1 font-serif italic">
            Thoughts pinned to parchment in the quiet hours.
          </p>
        </div>

        {/* Inlaid Flyleaf Card (Warm Ivory Paper Plate) */}
        <div className="relative z-10 bg-[#fefaf2] text-[#241810] rounded-xl p-5 md:p-7 lg:p-8 shadow-[0_8px_30px_rgba(40,20,10,0.25)] border border-[#ded1be] flex-1 flex flex-col justify-center my-2 max-w-xl mx-auto w-full">
          {/* Subtle tab switcher on the flyleaf */}
          <div className="flex border-b border-[#ded5c5] pb-3 mb-5">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 text-center py-2 text-xs md:text-sm font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                mode === "login"
                  ? "text-[#241810] border-b-2 border-[#241810] font-bold"
                  : "text-[#8c7a67] hover:text-[#453e37]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 text-center py-2 text-xs md:text-sm font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                mode === "signup"
                  ? "text-[#241810] border-b-2 border-[#241810] font-bold"
                  : "text-[#8c7a67] hover:text-[#453e37]"
              }`}
            >
              New Ledger
            </button>
          </div>

          <div className="w-full">
            {mode === "login" ? (
              <LoginForm onSuccess={handleAuthSuccess} />
            ) : (
              <SignupForm onSuccess={() => setMode("login")} />
            )}
          </div>
        </div>

        {/* Subtle footer deboss */}
        <div className="mt-3 text-center text-[10px] md:text-xs tracking-widest text-[#edd2ba] uppercase font-sans">
          Leaves turn. Words rest in ink.
        </div>
      </div>
    </div>
  );
}
