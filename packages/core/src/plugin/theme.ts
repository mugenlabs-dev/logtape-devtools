export const theme = {
  colors: {
    background: "#1e1e1e",
    surface: "#1a1a1a",
    surfaceHover: "#2a2a2a",
    surfaceSelected: "#2a2a3a",
    border: "#333",
    borderInput: "#444",
    borderFocus: "#6366f1",

    textPrimary: "#e0e0e0",
    textSecondary: "#888",
    textMuted: "#666",
    textDimmed: "#555",
    white: "#fff",

    accent: "#6366f1",
    accentHover: "#818cf8",

    levels: {
      trace: { bg: "#1a1a2e", color: "#8888bb", badge: "#5555aa" },
      debug: { bg: "#1a2a1a", color: "#88bb88", badge: "#55aa55" },
      info: { bg: "#1a2a3a", color: "#60a5fa", badge: "#3b82f6" },
      warning: { bg: "#2a2a1a", color: "#facc15", badge: "#eab308" },
      error: { bg: "#2a1a1a", color: "#ef4444", badge: "#dc2626" },
      fatal: { bg: "#3a0a0a", color: "#ff6b6b", badge: "#b91c1c" },
    },

    scrollbar: "#444",
    scrollbarHover: "#555",
  },

  fontFamily: {
    mono: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace',
    sans: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },

  fontSize: {
    xs: "9px",
    sm: "10px",
    md: "11px",
    base: "12px",
    lg: "13px",
  },

  radius: {
    sm: "3px",
    md: "4px",
    lg: "6px",
    pill: "10px",
  },

  spacing: {
    xs: "2px",
    sm: "4px",
    md: "6px",
    lg: "8px",
    xl: "12px",
    xxl: "16px",
  },
} as const;

export type LogLevelColors = (typeof theme.colors.levels)[keyof typeof theme.colors.levels];
