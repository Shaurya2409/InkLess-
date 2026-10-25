"use client";

import { memo, useMemo } from "react";

interface CornerFlipbookProps {
  pageNumber: number;
  spreadIndex: number;
  onFlipNext?: () => void;
  onStartRiffle?: () => void;
  onStopRiffle?: () => void;
  canFlip?: boolean;
  isLastSpread?: boolean;
  className?: string;
}

const TOTAL_POSES = 13;

function CornerFlipbook({
  pageNumber,
  spreadIndex,
  onFlipNext,
  onStartRiffle,
  onStopRiffle,
  canFlip = true,
  isLastSpread = false,
  className = "",
}: CornerFlipbookProps) {
  // Deterministic 13-pose cycle: advances exactly 1 pose per spread/page
  const poseIndex = useMemo(() => {
    return Math.abs(spreadIndex) % TOTAL_POSES;
  }, [spreadIndex]);

  // Click advances 1 spread
  const handleClick = () => {
    if (canFlip && onFlipNext && !isLastSpread) {
      onFlipNext();
    }
  };

  const handleStartRiffle = () => {
    if (canFlip && onStartRiffle) {
      onStartRiffle();
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseDown={handleStartRiffle}
      onMouseUp={onStopRiffle}
      onMouseLeave={onStopRiffle}
      onTouchStart={handleStartRiffle}
      onTouchEnd={onStopRiffle}
      title={
        canFlip && !isLastSpread
          ? `Dancing Stickman (Pose ${poseIndex + 1}) • Hold to flick fast & make him dance!`
          : `Dancing Stickman (Pose ${poseIndex + 1}) • Pin more thoughts to expand notebook`
      }
      className={`
        flipbook-perspective relative group select-none
        w-[94px] h-[116px] bg-[#fbf6ea] rounded-tl-[4px] rounded-bl-[2px] rounded-br-[6px] rounded-tr-[2px]
        border-[1.5px] border-[#29221b] flipbook-stack-13 flex flex-col justify-between p-2
        transition-transform
        ${canFlip && !isLastSpread ? "cursor-pointer active:scale-[0.98]" : "cursor-default opacity-85"}
        ${className}
      `}
    >
      {/* 
        -------------------------------------------------------------
        Top Mini Binding Strip & Pose Badge
        -------------------------------------------------------------
      */}
      <div className="flex justify-between items-center pb-1 border-b border-[#29221b]/20 z-10 pointer-events-none">
        <span className="font-mono text-[7.5px] font-black tracking-widest text-[#29221b] uppercase">
          LEAF #{pageNumber}
        </span>
        <span className="font-mono text-[7.5px] font-bold text-[#6a543f] bg-black/5 px-1 py-0.2 rounded-[2px]">
          FRAME #{poseIndex + 1}
        </span>
      </div>

      {/* 
        -------------------------------------------------------------
        13-Pose Dancing Stickman Holding Page Number Canvas
        -------------------------------------------------------------
      */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden my-0.5 pointer-events-none">
        <svg
          viewBox="0 0 88 94"
          className="w-full h-full"
          fill="none"
          stroke="#201710"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Ground Baseline Line */}
          <line
            x1="12"
            y1="86"
            x2="76"
            y2="86"
            stroke="#91806f"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />

          {/* 
            =============================================================
            POSE 0 (Page 1): Center Bounce, holding number chest-high
            =============================================================
          */}
          {poseIndex === 0 && (
            <g>
              <circle cx="44" cy="24" r="5.5" strokeWidth="2.2" />
              <line x1="44" y1="29.5" x2="44" y2="52" strokeWidth="2.2" />
              <polyline points="44,34 30,42 34,46" strokeWidth="2" />
              <polyline points="44,34 58,42 54,46" strokeWidth="2" />
              <polyline points="44,52 36,68 34,86" strokeWidth="2.2" />
              <polyline points="44,52 52,68 54,86" strokeWidth="2.2" />
              {/* Placard */}
              <g transform="translate(28, 36)">
                <rect width="32" height="18" rx="2" fill="#faf7ef" stroke="#201710" strokeWidth="1.6" />
                <text x="16" y="13" textAnchor="middle" fill="#201710" stroke="none" className="font-serif font-black text-[11px]">
                  {pageNumber}
                </text>
              </g>
            </g>
          )}

          {/* 
            =============================================================
            POSE 1 (Page 2): Left Hip Sway, tilting number left
            =============================================================
          */}
          {poseIndex === 1 && (
            <g>
              <circle cx="41" cy="24" r="5.5" strokeWidth="2.2" />
              <line x1="41" y1="29.5" x2="38" y2="51" strokeWidth="2.2" />
              <polyline points="41,33 26,38 30,42" strokeWidth="2" />
              <polyline points="41,33 52,40 48,44" strokeWidth="2" />
              <polyline points="38,51 28,66 24,86" strokeWidth="2.2" />
              <polyline points="38,51 46,68 48,86" strokeWidth="2.2" />
              {/* Placard tilted left */}
              <g transform="translate(38, 42) rotate(-7) translate(-16, -9)">
                <rect width="32" height="18" rx="2" fill="#faf7ef" stroke="#201710" strokeWidth="1.6" />
                <text x="16" y="13" textAnchor="middle" fill="#201710" stroke="none" className="font-serif font-black text-[11px]">
                  {pageNumber}
                </text>
              </g>
            </g>
          )}

          {/* 
            =============================================================
            POSE 2 (Page 3): High Reach Overhead on Tiptoes
            =============================================================
          */}
          {poseIndex === 2 && (
            <g>
              <circle cx="44" cy="27" r="5.5" strokeWidth="2.2" />
              <line x1="44" y1="32.5" x2="44" y2="52" strokeWidth="2.2" />
              <polyline points="44,35 34,22 34,16" strokeWidth="2" />
              <polyline points="44,35 54,22 54,16" strokeWidth="2" />
              <polyline points="44,52 40,68 41,86" strokeWidth="2.2" />
              <polyline points="44,52 48,68 47,86" strokeWidth="2.2" />
              {/* Placard raised high overhead */}
              <g transform="translate(28, 5)">
                <rect width="32" height="18" rx="2" fill="#faf7ef" stroke="#201710" strokeWidth="1.6" />
                <text x="16" y="13" textAnchor="middle" fill="#201710" stroke="none" className="font-serif font-black text-[11px]">
                  {pageNumber}
                </text>
              </g>
            </g>
          )}

          {/* 
            =============================================================
            POSE 3 (Page 4): Right Head Bob & Right Knee Kick Up
            =============================================================
          */}
          {poseIndex === 3 && (
            <g>
              <circle cx="48" cy="24" r="5.5" strokeWidth="2.2" />
              <line x1="48" y1="29.5" x2="45" y2="52" strokeWidth="2.2" />
              <polyline points="48,33 38,42 40,46" strokeWidth="2" />
              <polyline points="48,33 62,40 58,44" strokeWidth="2" />
              <polyline points="45,52 42,68 42,86" strokeWidth="2.2" />
              <polyline points="45,52 58,62 54,73" strokeWidth="2.2" />
              {/* Placard tilted right */}
              <g transform="translate(50, 42) rotate(6) translate(-16, -9)">
                <rect width="32" height="18" rx="2" fill="#faf7ef" stroke="#201710" strokeWidth="1.6" />
                <text x="16" y="13" textAnchor="middle" fill="#201710" stroke="none" className="font-serif font-black text-[11px]">
                  {pageNumber}
                </text>
              </g>
            </g>
          )}

          {/* 
            =============================================================
            POSE 4 (Page 5): Low Side-Shuffle Dip to Right
            =============================================================
          */}
          {poseIndex === 4 && (
            <g>
              <circle cx="47" cy="28" r="5.5" strokeWidth="2.2" />
              <line x1="47" y1="33.5" x2="49" y2="56" strokeWidth="2.2" />
              <polyline points="47,37 40,45 44,48" strokeWidth="2" />
              <polyline points="47,37 60,43 62,47" strokeWidth="2" />
              <polyline points="49,56 38,70 34,86" strokeWidth="2.2" />
              <polyline points="49,56 58,70 58,86" strokeWidth="2.2" />
              {/* Placard held out right */}
              <g transform="translate(53, 47) translate(-16, -9)">
                <rect width="32" height="18" rx="2" fill="#faf7ef" stroke="#201710" strokeWidth="1.6" />
                <text x="16" y="13" textAnchor="middle" fill="#201710" stroke="none" className="font-serif font-black text-[11px]">
                  {pageNumber}
                </text>
              </g>
            </g>
          )}

          {/* 
            =============================================================
            POSE 5 (Page 6): Mid-Air Hop (Feet Off Ground!)
            =============================================================
          */}
          {poseIndex === 5 && (
            <g>
              <circle cx="44" cy="18" r="5.5" strokeWidth="2.2" />
              <line x1="44" y1="23.5" x2="44" y2="44" strokeWidth="2.2" />
              <polyline points="44,27 30,24 33,28" strokeWidth="2" />
              <polyline points="44,27 58,24 55,28" strokeWidth="2" />
              <polyline points="44,44 34,58 36,70" strokeWidth="2.2" />
              <polyline points="44,44 54,58 52,70" strokeWidth="2.2" />
              {/* Jump dust marks on baseline */}
              <circle cx="36" cy="85" r="1.5" fill="#a89a87" stroke="none" />
              <circle cx="52" cy="85" r="1.5" fill="#a89a87" stroke="none" />
              {/* Placard held high */}
              <g transform="translate(28, 22)">
                <rect width="32" height="18" rx="2" fill="#faf7ef" stroke="#201710" strokeWidth="1.6" />
                <text x="16" y="13" textAnchor="middle" fill="#201710" stroke="none" className="font-serif font-black text-[11px]">
                  {pageNumber}
                </text>
              </g>
            </g>
          )}

          {/* 
            =============================================================
            POSE 6 (Page 7): Landing Shimmy with Hips Right
            =============================================================
          */}
          {poseIndex === 6 && (
            <g>
              <circle cx="45" cy="25" r="5.5" strokeWidth="2.2" />
              <line x1="45" y1="30.5" x2="49" y2="53" strokeWidth="2.2" />
              <polyline points="45,34 34,44 38,47" strokeWidth="2" />
              <polyline points="45,34 58,42 56,46" strokeWidth="2" />
              <polyline points="49,53 40,68 38,86" strokeWidth="2.2" />
              <polyline points="49,53 58,68 62,86" strokeWidth="2.2" />
              {/* Placard */}
              <g transform="translate(48, 44) rotate(4) translate(-16, -9)">
                <rect width="32" height="18" rx="2" fill="#faf7ef" stroke="#201710" strokeWidth="1.6" />
                <text x="16" y="13" textAnchor="middle" fill="#201710" stroke="none" className="font-serif font-black text-[11px]">
                  {pageNumber}
                </text>
              </g>
            </g>
          )}

          {/* 
            =============================================================
            POSE 7 (Page 8): Funky Groove Angle (Swinging Placard Low Left)
            =============================================================
          */}
          {poseIndex === 7 && (
            <g>
              <circle cx="42" cy="26" r="5.5" strokeWidth="2.2" />
              <line x1="42" y1="31.5" x2="40" y2="53" strokeWidth="2.2" />
              <polyline points="42,35 28,48 28,54" strokeWidth="2" />
              <polyline points="42,35 36,48 36,54" strokeWidth="2" />
              <polyline points="40,53 34,68 32,86" strokeWidth="2.2" />
              <polyline points="40,53 50,68 52,86" strokeWidth="2.2" />
              {/* Placard low left */}
              <g transform="translate(32, 54) rotate(-5) translate(-16, -9)">
                <rect width="32" height="18" rx="2" fill="#faf7ef" stroke="#201710" strokeWidth="1.6" />
                <text x="16" y="13" textAnchor="middle" fill="#201710" stroke="none" className="font-serif font-black text-[11px]">
                  {pageNumber}
                </text>
              </g>
            </g>
          )}

          {/* 
            =============================================================
            POSE 8 (Page 9): One-Hand Wave Aloft & Hand on Hip
            =============================================================
          */}
          {poseIndex === 8 && (
            <g>
              <circle cx="42" cy="23" r="5.5" strokeWidth="2.2" />
              <line x1="42" y1="28.5" x2="44" y2="50" strokeWidth="2.2" />
              <polyline points="42,32 32,38 38,48" strokeWidth="2" />
              <polyline points="42,32 52,24 54,19" strokeWidth="2" />
              <polyline points="44,50 36,67 34,86" strokeWidth="2.2" />
              <polyline points="44,50 50,67 52,86" strokeWidth="2.2" />
              {/* Placard held aloft in right hand */}
              <g transform="translate(54, 17) rotate(8) translate(-16, -9)">
                <rect width="32" height="18" rx="2" fill="#faf7ef" stroke="#201710" strokeWidth="1.6" />
                <text x="16" y="13" textAnchor="middle" fill="#201710" stroke="none" className="font-serif font-black text-[11px]">
                  {pageNumber}
                </text>
              </g>
            </g>
          )}

          {/* 
            =============================================================
            POSE 9 (Page 10): Left Kick-Step with Swing
            =============================================================
          */}
          {poseIndex === 9 && (
            <g>
              <circle cx="43" cy="25" r="5.5" strokeWidth="2.2" />
              <line x1="43" y1="30.5" x2="45" y2="52" strokeWidth="2.2" />
              <polyline points="43,34 28,46 32,49" strokeWidth="2" />
              <polyline points="43,34 46,46 44,49" strokeWidth="2" />
              <polyline points="45,52 32,62 24,70" strokeWidth="2.2" />
              <polyline points="45,52 48,68 48,86" strokeWidth="2.2" />
              {/* Placard swung down toward kicking leg */}
              <g transform="translate(38, 49) rotate(-8) translate(-16, -9)">
                <rect width="32" height="18" rx="2" fill="#faf7ef" stroke="#201710" strokeWidth="1.6" />
                <text x="16" y="13" textAnchor="middle" fill="#201710" stroke="none" className="font-serif font-black text-[11px]">
                  {pageNumber}
                </text>
              </g>
            </g>
          )}

          {/* 
            =============================================================
            POSE 10 (Page 11): Right Kick-Step with Swing
            =============================================================
          */}
          {poseIndex === 10 && (
            <g>
              <circle cx="45" cy="25" r="5.5" strokeWidth="2.2" />
              <line x1="45" y1="30.5" x2="43" y2="52" strokeWidth="2.2" />
              <polyline points="45,34 42,46 44,49" strokeWidth="2" />
              <polyline points="45,34 60,46 56,49" strokeWidth="2" />
              <polyline points="43,52 40,68 40,86" strokeWidth="2.2" />
              <polyline points="43,52 56,62 64,70" strokeWidth="2.2" />
              {/* Placard swung right toward kicking leg */}
              <g transform="translate(50, 49) rotate(8) translate(-16, -9)">
                <rect width="32" height="18" rx="2" fill="#faf7ef" stroke="#201710" strokeWidth="1.6" />
                <text x="16" y="13" textAnchor="middle" fill="#201710" stroke="none" className="font-serif font-black text-[11px]">
                  {pageNumber}
                </text>
              </g>
            </g>
          )}

          {/* 
            =============================================================
            POSE 11 (Page 12): Deep Funky Squat Groove Dip
            =============================================================
          */}
          {poseIndex === 11 && (
            <g>
              <circle cx="44" cy="29" r="5.5" strokeWidth="2.2" />
              <line x1="44" y1="34.5" x2="44" y2="56" strokeWidth="2.2" />
              <polyline points="44,38 30,44 33,48" strokeWidth="2" />
              <polyline points="44,38 58,44 55,48" strokeWidth="2" />
              <polyline points="44,56 28,70 30,86" strokeWidth="2.2" />
              <polyline points="44,56 60,70 58,86" strokeWidth="2.2" />
              {/* Placard held low in front */}
              <g transform="translate(44, 48) translate(-16, -9)">
                <rect width="32" height="18" rx="2" fill="#faf7ef" stroke="#201710" strokeWidth="1.6" />
                <text x="16" y="13" textAnchor="middle" fill="#201710" stroke="none" className="font-serif font-black text-[11px]">
                  {pageNumber}
                </text>
              </g>
            </g>
          )}

          {/* 
            =============================================================
            POSE 12 (Page 13): Spring & Pop, raising back to chest
            =============================================================
          */}
          {poseIndex === 12 && (
            <g>
              <circle cx="44" cy="23" r="5.5" strokeWidth="2.2" />
              <line x1="44" y1="28.5" x2="44" y2="50" strokeWidth="2.2" />
              <polyline points="44,32 32,36 34,40" strokeWidth="2" />
              <polyline points="44,32 56,36 54,40" strokeWidth="2" />
              <polyline points="44,50 38,67 38,86" strokeWidth="2.2" />
              <polyline points="44,50 50,67 50,86" strokeWidth="2.2" />
              {/* Upward motion lines */}
              <line x1="32" y1="78" x2="32" y2="72" stroke="#a89a87" strokeWidth="1" />
              <line x1="56" y1="78" x2="56" y2="72" stroke="#a89a87" strokeWidth="1" />
              {/* Placard rising back to chest level */}
              <g transform="translate(44, 40) translate(-16, -9)">
                <rect width="32" height="18" rx="2" fill="#faf7ef" stroke="#201710" strokeWidth="1.6" />
                <text x="16" y="13" textAnchor="middle" fill="#201710" stroke="none" className="font-serif font-black text-[11px]">
                  {pageNumber}
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* 
        -------------------------------------------------------------
        Bottom Indicator & 13-Pose Dance Track Progress Dots
        -------------------------------------------------------------
      */}
      <div className="flex justify-between items-center pt-1 border-t border-[#29221b]/15 z-10 pointer-events-none">
        <span className="font-mono text-[7px] tracking-wider text-[#63513e] uppercase">
          DANCE LOOP
        </span>

        {/* 13 Dance Pose Dots */}
        <div className="flex items-center gap-[2px]">
          {[...Array(TOTAL_POSES)].map((_, idx) => (
            <div
              key={idx}
              className={`
                h-1.5 rounded-full transition-all
                ${
                  idx === poseIndex
                    ? "w-2 bg-[#29221b]"
                    : "w-0.5 bg-[#b8a68f]"
                }
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(CornerFlipbook);
