const NOTE_WIDTH = 240;
const NOTE_HEIGHT = 140;
const MIN_X = 240;
const MIN_Y = 20;

type ExistingNote = {
  x: number;
  y: number;
};

const GAP = 30;
const MAX_X = 1500;
const MAX_Y = 800;

function overlaps(
  x: number,
  y: number,
  notes: ExistingNote[]
) {
  return notes.some((note) => {
    return (
      x < note.x + NOTE_WIDTH + GAP &&
      x + NOTE_WIDTH + GAP > note.x &&
      y < note.y + NOTE_HEIGHT + GAP &&
      y + NOTE_HEIGHT + GAP > note.y
    );
  });
}

export function findFreePosition(
  notes: ExistingNote[]
) {
  // Try grid-based placement first (fast, deterministic)
  const stepX = NOTE_WIDTH + GAP;
  const stepY = NOTE_HEIGHT + GAP;

  for (let gy = MIN_Y; gy <= MAX_Y; gy += stepY) {
    for (let gx = MIN_X; gx <= MAX_X; gx += stepX) {
      // Add small random jitter for organic feel (±15px)
      const jitterX = Math.floor(Math.random() * 30) - 15;
      const jitterY = Math.floor(Math.random() * 30) - 15;
      const x = gx + jitterX;
      const y = gy + jitterY;

      if (!overlaps(x, y, notes)) {
        return { x, y };
      }
    }
  }

  // Fallback: random attempts
  for (let i = 0; i < 50; i++) {
    const x = Math.floor(Math.random() * (MAX_X - MIN_X)) + MIN_X;
    const y = Math.floor(Math.random() * (MAX_Y - MIN_Y)) + MIN_Y;

    if (!overlaps(x, y, notes)) {
      return { x, y };
    }
  }

  // Final fallback
  return { x: MIN_X, y: MIN_Y };
}