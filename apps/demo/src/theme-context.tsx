import { play } from "cuelume";
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

const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- light-switch click sound ----

const playLightSwitchSound = (targetTheme: Theme) => {
  try {
    play(targetTheme === "light" ? "tick" : "press");
  } catch {
    // audio unavailable — never break the toggle
  }
};

/** Flip data-theme / color-scheme only — tokens live in styles.css (light-dark). */
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
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
    {
      // Theme view-transition duration is an explicit exception to motion tokens (M6).
      duration: 500,
      easing: "ease-in-out",
      pseudoElement: "::view-transition-new(root)",
    }
  );
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(getSavedTheme);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      applyTheme(theme);
      initialized.current = true;
    }
  }, [theme]);

  const toggleTheme = useCallback(
    (e?: React.MouseEvent) => {
      const next = theme === "dark" ? "light" : "dark";
      const reducedMotion = prefersReducedMotion();

      if (!reducedMotion) {
        playLightSwitchSound(next);
      }

      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? 0;

      const applyNext = () => {
        setTheme(next);
        applyTheme(next);
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch {
          // localStorage unavailable
        }
      };

      if (!reducedMotion && typeof document.startViewTransition === "function") {
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
