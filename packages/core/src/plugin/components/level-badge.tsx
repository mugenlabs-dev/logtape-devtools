import type { LogLevel } from "../../types";
import { getLevelColors, theme } from "../theme";

const LEVEL_LABELS: Record<LogLevel, string> = {
  debug: "DBG",
  error: "ERR",
  fatal: "FTL",
  info: "INF",
  trace: "TRC",
  warning: "WRN",
};

export const LevelBadge = ({ level }: { level: LogLevel }) => {
  const colors = getLevelColors(level);
  const label = (LEVEL_LABELS as Record<string, string | undefined>)[level] ?? level.toUpperCase();

  return (
    <span
      style={{
        background: colors.badge,
        borderRadius: theme.radius.sm,
        color: theme.colors.white,
        display: "inline-block",
        fontFamily: theme.fontFamily.mono,
        fontSize: theme.fontSize.sm,
        fontWeight: 600,
        lineHeight: 1,
        minWidth: "28px",
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        textAlign: "center",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
};
