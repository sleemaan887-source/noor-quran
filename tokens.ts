// Centralized design tokens. Single source of truth for colors used in code.
// Tailwind classes cover most styling; these constants serve dynamic JS contexts
// (canvas, inline SVG, computed values) where classes can't reach.

export const COLORS = {
  primary: '#0B3954',
  primaryLight: '#2E7A95',
  secondary: '#1B998B',
  gold: '#D4AF37',
  goldLight: '#E8C46D',
  bgLight: '#FAF7F0',
  bgDark: '#071A21',
} as const;

export const QURAN_FONT_SIZES = [20, 24, 28, 32, 38, 44] as const;
export const DEFAULT_QURAN_FONT_SIZE = 28;

export const UI_FONT_SCALES = [0.85, 0.92, 1, 1.12, 1.25] as const;
export const DEFAULT_UI_FONT_SCALE = 1;
