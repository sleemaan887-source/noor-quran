import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

type ThemeState = {
  mode: ThemeMode;
  isDark: boolean;
  quranFontSize: number;
  setMode: (m: ThemeMode) => void;
  setQuranFontSize: (n: number) => void;
};

const ThemeContext = createContext<ThemeState | null>(null);

const STORAGE_KEY = 'noor.theme';

function readInitial(): { mode: ThemeMode; quranFontSize: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        mode: parsed.mode === 'dark' || parsed.mode === 'auto' ? parsed.mode : 'light',
        quranFontSize: typeof parsed.quranFontSize === 'number' ? parsed.quranFontSize : 28,
      };
    }
  } catch {
    // ignore
  }
  return { mode: 'light', quranFontSize: 28 };
}

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(readInitial, []);
  const [mode, setModeState] = useState<ThemeMode>(initial.mode);
  const [quranFontSize, setQuranFontSizeState] = useState<number>(initial.quranFontSize);
  const [isDark, setIsDark] = useState<boolean>(
    initial.mode === 'dark' || (initial.mode === 'auto' && systemPrefersDark()),
  );

  // Apply theme class to <html> and persist.
  useEffect(() => {
    const dark = mode === 'dark' || (mode === 'auto' && systemPrefersDark());
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, quranFontSize }));
    } catch {
      // ignore
    }
  }, [mode, quranFontSize]);

  // React to system changes in auto mode.
  useEffect(() => {
    if (mode !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const dark = mq.matches;
      setIsDark(dark);
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  const value = useMemo<ThemeState>(
    () => ({
      mode,
      isDark,
      quranFontSize,
      setMode: setModeState,
      setQuranFontSize: setQuranFontSizeState,
    }),
    [mode, isDark, quranFontSize],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
