export type FastenerType = "brass-clip" | "kraft-tape" | "pegholes" | "draft-tape";

export interface AtelierTheme {
  id: string;
  name: string;
  subtitle: string;
  paperBg: string;
  paperBorder: string;
  gridOverlay?: string;
  fastener: FastenerType;
  fastenerPosition?: "center" | "left" | "right";
  tiltAngle: string;
  inkColor: string;
  accentBadge: {
    text: string;
    style: string;
  };
}

export const ATELIER_THEMES: AtelierTheme[] = [
  // 1. Storyboard Animation Sheet (Ratatouille Animator Style)
  {
    id: "storyboard",
    name: "Storyboard Sheet",
    subtitle: "SCENE // THOUGHT",
    paperBg: "bg-[#fbf7ed]",
    paperBorder: "border-[#2c241c]",
    fastener: "pegholes",
    tiltAngle: "-rotate-[1deg]",
    inkColor: "text-[#1d1711]",
    accentBadge: {
      text: "FRAME // 01",
      style: "font-mono text-[8px] font-bold tracking-widest text-[#5c4a38]",
    },
  },
  // 2. Parisian Bistro Ledger Grid
  {
    id: "bistro-ledger",
    name: "Bistro Ledger",
    subtitle: "PARISIAN LEDGER",
    paperBg: "bg-[#f6f0e2]",
    paperBorder: "border-[#29221a]",
    gridOverlay: "radial-gradient(#baa993 0.85px, transparent 0.85px)",
    fastener: "brass-clip",
    fastenerPosition: "left",
    tiltAngle: "rotate-[1.4deg]",
    inkColor: "text-[#241c14]",
    accentBadge: {
      text: "LEAF MEMO",
      style: "font-serif text-[8px] font-black tracking-wider text-[#7c3826]",
    },
  },
  // 3. Atelier Raw Kraft Scrap
  {
    id: "kraft-scrap",
    name: "Atelier Kraft",
    subtitle: "RAW KRAFT SCRAP",
    paperBg: "bg-[#d8c39e]",
    paperBorder: "border-[#292017]",
    fastener: "kraft-tape",
    fastenerPosition: "center",
    tiltAngle: "-rotate-[1.5deg]",
    inkColor: "text-[#1c140d]",
    accentBadge: {
      text: "SCRAP // ATELIER",
      style: "font-mono text-[8px] font-bold text-[#4e3520]",
    },
  },
  // 4. Golden Ochre Memo
  {
    id: "golden-ochre",
    name: "Golden Ochre",
    subtitle: "FLASH MEMO",
    paperBg: "bg-[#f6df94]",
    paperBorder: "border-[#2a2116]",
    fastener: "kraft-tape",
    fastenerPosition: "right",
    tiltAngle: "rotate-[1.1deg]",
    inkColor: "text-[#1a130b]",
    accentBadge: {
      text: "NOTE",
      style: "bg-[#2a2116] text-[#f7e8b2] px-1 py-0.2 font-sans font-black text-[7.5px] uppercase rounded-[2px]",
    },
  },
  // 5. Architectural Blueprint Draft
  {
    id: "blueprint-draft",
    name: "Blueprint Draft",
    subtitle: "SCHEMATIC DRAFT",
    paperBg: "bg-[#d3e3f0]",
    paperBorder: "border-[#1c2936]",
    gridOverlay:
      "linear-gradient(to right, rgba(52, 98, 140, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(52, 98, 140, 0.12) 1px, transparent 1px)",
    fastener: "draft-tape",
    fastenerPosition: "center",
    tiltAngle: "-rotate-[0.9deg]",
    inkColor: "text-[#0e1b2b]",
    accentBadge: {
      text: "DRAFT // SPEC",
      style: "font-mono text-[8px] font-bold tracking-wider text-[#1d4263]",
    },
  },
  // 6. Charcoal Drawing Vellum
  {
    id: "charcoal-vellum",
    name: "Sketch Vellum",
    subtitle: "VELLUM MEMO",
    paperBg: "bg-[#eae6db]",
    paperBorder: "border-[#2b2722]",
    fastener: "brass-clip",
    fastenerPosition: "right",
    tiltAngle: "rotate-[0.8deg]",
    inkColor: "text-[#181613]",
    accentBadge: {
      text: "VELLUM // Nº6",
      style: "font-mono text-[8px] font-semibold tracking-wider text-[#544e45]",
    },
  },
];

/**
 * Deterministically resolve an AtelierTheme from a string (e.g. note._id) or numeric slot.
 */
export function getAtelierTheme(seed: string | number): AtelierTheme {
  if (typeof seed === "number") {
    return ATELIER_THEMES[Math.abs(seed) % ATELIER_THEMES.length];
  }

  // Check if seed directly matches a theme ID
  const directMatch = ATELIER_THEMES.find((t) => t.id === seed);
  if (directMatch) return directMatch;

  // Hash the note ID string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % ATELIER_THEMES.length;
  return ATELIER_THEMES[idx];
}
