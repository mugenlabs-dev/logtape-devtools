export const theme = {
  colors: {
    accent: "#818cf8",
    accentHover: "#a5b4fc",
    background: "#1e1e1e",
    border: "#333",
    borderFocus: "#6366f1",
    borderInput: "#444",

    levels: {
      // `text` sits on `badge` and keeps at least 4.5:1 contrast against it.
      debug: { badge: "#2f7a2f", bg: "#1a2a1a", color: "#88bb88", text: "#fff" },
      error: { badge: "#dc2626", bg: "#2a1a1a", color: "#f87171", text: "#fff" },
      fatal: { badge: "#b91c1c", bg: "#3a0a0a", color: "#ff6b6b", text: "#fff" },
      info: { badge: "#2563eb", bg: "#1a2a3a", color: "#60a5fa", text: "#fff" },
      trace: { badge: "#5555aa", bg: "#1a1a2e", color: "#8888bb", text: "#fff" },
      warning: { badge: "#eab308", bg: "#2a2a1a", color: "#facc15", text: "#1a1a1a" },
    },

    scrollbar: "#444",
    scrollbarHover: "#555",
    surface: "#1a1a1a",
    surfaceHover: "#2a2a2a",
    surfaceSelected: "#2a2a3a",
    // Text colours keep at least 4.5:1 contrast on every panel background, including the level row tints.
    textDimmed: "#949494",
    textMuted: "#999",

    textPrimary: "#e0e0e0",
    textSecondary: "#a3a3a3",
    white: "#fff",
  },

  fontFamily: {
    mono: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace',
    sans: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },

  fontSize: {
    base: "12px",
    lg: "13px",
    md: "11px",
    sm: "10px",
    xs: "9px",
  },

  radius: {
    lg: "6px",
    md: "4px",
    pill: "10px",
    sm: "3px",
  },

  spacing: {
    lg: "8px",
    md: "6px",
    sm: "4px",
    xl: "12px",
    xs: "2px",
    xxl: "16px",
  },
} as const;

export type LogLevelColors = (typeof theme.colors.levels)[keyof typeof theme.colors.levels];

/**
 * Colors for a level, falling back to "info" for levels this version does not
 * know about (the LogTape peer range allows newer levels to appear).
 */
export const getLevelColors = (level: string): LogLevelColors =>
  (theme.colors.levels as Record<string, LogLevelColors | undefined>)[level] ??
  theme.colors.levels.info;
