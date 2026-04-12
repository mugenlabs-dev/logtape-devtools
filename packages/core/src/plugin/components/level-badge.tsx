import type { LogLevel } from "../../types";
import { theme } from "../theme";

const LEVEL_LABELS: Record<LogLevel, string> = {
  trace: "TRC",
  debug: "DBG",
  info: "INF",
  warning: "WRN",
  error: "ERR",
  fatal: "FTL",
};

export const LevelBadge = ({ level }: { level: LogLevel }) => {
  const colors = theme.colors.levels[level];

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
      {LEVEL_LABELS[level]}
    </span>
  );
};
