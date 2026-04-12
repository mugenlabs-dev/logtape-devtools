import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: (e?: React.MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {
    // no-op default
  },
});

export const useTheme = () => useContext(ThemeContext);

// ---- light-switch click sound helpers ----

interface ToneConfig {
  endFreq: number;
  endTime: number;
  gainVal: number;
  rampTime: number;
  startFreq: number;
  startTime: number;
}

const playTone = (ctx: AudioContext, config: ToneConfig) => {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(config.gainVal, config.startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, config.endTime);
  osc.frequency.setValueAtTime(config.startFreq, config.startTime);
  osc.frequency.exponentialRampToValueAtTime(config.endFreq, config.rampTime);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(config.startTime);
  osc.stop(config.endTime);
};

let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  try {
    if (sharedAudioCtx == null || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new AudioContext();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
};

const playLightSwitchSound = (targetTheme: Theme) => {
  const ctx = getAudioContext();
  if (ctx == null) {
    return;
  }
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  const now = ctx.currentTime;

  if (targetTheme === "light") {
    playTone(ctx, {
      endFreq: 800,
      endTime: now + 0.15,
      gainVal: 0.25,
      rampTime: now + 0.08,
      startFreq: 400,
      startTime: now,
    });
    playTone(ctx, {
      endFreq: 800,
      endTime: now + 0.1,
      gainVal: 0.08,
      rampTime: now + 0.1,
      startFreq: 1200,
      startTime: now + 0.02,
    });
  } else {
    playTone(ctx, {
      endFreq: 200,
      endTime: now + 0.15,
      gainVal: 0.25,
      rampTime: now + 0.12,
      startFreq: 500,
      startTime: now,
    });
    playTone(ctx, {
      endFreq: 150,
      endTime: now + 0.12,
      gainVal: 0.1,
      rampTime: now + 0.12,
      startFreq: 300,
      startTime: now,
    });
  }
};

// ---- CSS variables for each theme ----
const themeVars: Record<Theme, Record<string, string>> = {
  dark: {
    "--accent": "#6366f1",
    "--accent-green": "#4ade80",
    "--accent-light": "#818cf8",
    "--bg-primary": "#0a0a0a",
    "--bg-secondary": "#111",
    "--bg-tertiary": "#1a1a1a",
    "--border-primary": "#222",
    "--border-secondary": "#333",
    "--card-bg": "#111",
    "--code-bg": "rgba(255,255,255,0.06)",
    "--code-block-bg": "#0d1117",
    "--header-bg": "rgba(10, 10, 10, 0.85)",
    "--text-dimmed": "#666",
    "--text-muted": "#888",
    "--text-primary": "#fff",
    "--text-secondary": "#e0e0e0",
    "--text-tertiary": "#aaa",
  },
  light: {
    "--accent": "#4f46e5",
    "--accent-green": "#16a34a",
    "--accent-light": "#6366f1",
    "--bg-primary": "#f8f8f8",
    "--bg-secondary": "#fff",
    "--bg-tertiary": "#eee",
    "--border-primary": "#ddd",
    "--border-secondary": "#ccc",
    "--card-bg": "#fff",
    "--code-bg": "rgba(0,0,0,0.05)",
    "--code-block-bg": "#1e293b",
    "--header-bg": "rgba(248, 248, 248, 0.85)",
    "--text-dimmed": "#999",
    "--text-muted": "#666",
    "--text-primary": "#1a1a1a",
    "--text-secondary": "#333",
    "--text-tertiary": "#555",
  },
};

const applyThemeVars = (theme: Theme) => {
  const vars = themeVars[theme];
  for (const [key, value] of Object.entries(vars)) {
    document.documentElement.style.setProperty(key, value);
  }
  document.documentElement.dataset.theme = theme;
};

const THEME_KEY = "logtape-devtools:theme";

const getSystemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

const getSavedTheme = (): Theme => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") {
      return saved;
    }
  } catch {
    // localStorage unavailable
  }
  return getSystemTheme();
};

const animateViewTransition = (x: number, y: number) => {
  const maxRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );
  document.documentElement.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`] },
    { duration: 500, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" }
  );
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(getSavedTheme);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      applyThemeVars(theme);
      initialized.current = true;
    }
  }, [theme]);

  const toggleTheme = useCallback(
    (e?: React.MouseEvent) => {
      const next = theme === "dark" ? "light" : "dark";
      playLightSwitchSound(next);

      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? 0;

      const applyNext = () => {
        setTheme(next);
        applyThemeVars(next);
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch {
          // localStorage unavailable
        }
      };

      if (typeof document.startViewTransition === "function") {
        const transition = document.startViewTransition(applyNext);
        void transition.ready.then(() => animateViewTransition(x, y));
      } else {
        applyNext();
      }
    },
    [theme]
  );

  const contextValue = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};
