import { useCallback } from "react";
import type { DevtoolsLogRecord } from "../../types";
import { formatTime } from "../format";
import { ChevronRightIcon } from "../icons";
import { getLevelColors, theme } from "../theme";
import { LevelBadge } from "./level-badge";
import { LogDetail } from "./log-detail";

interface LogRowProps {
  expanded: boolean;
  onToggle: (id: string | null) => void;
  record: DevtoolsLogRecord;
}

const rowStyle = {
  alignItems: "center",
  border: "none",
  borderBottom: `1px solid ${theme.colors.border}`,
  cursor: "pointer",
  display: "flex",
  gap: theme.spacing.lg,
  padding: `${theme.spacing.md} ${theme.spacing.xl}`,
  textAlign: "left",
  transition: "background 0.1s, filter 0.1s",
  width: "100%",
} as const;

const timestampStyle = {
  color: theme.colors.textDimmed,
  flexShrink: 0,
  fontFamily: theme.fontFamily.mono,
  fontSize: theme.fontSize.md,
} as const;

const categoryStyle = {
  color: theme.colors.accent,
  flexShrink: 0,
  fontFamily: theme.fontFamily.mono,
  fontSize: theme.fontSize.md,
  maxWidth: "180px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;

const messageStyle = {
  color: theme.colors.textPrimary,
  flex: 1,
  fontSize: theme.fontSize.base,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;

const callerStyle = {
  color: theme.colors.textDimmed,
  flexShrink: 0,
  fontFamily: theme.fontFamily.mono,
  fontSize: theme.fontSize.sm,
  maxWidth: "200px",
  opacity: 0.7,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;

const chevronStyle = {
  color: theme.colors.textDimmed,
  display: "flex",
  flexShrink: 0,
  transition: "transform 0.15s",
} as const;

export const LogRow = ({ record, expanded, onToggle }: LogRowProps) => {
  const levelColors = getLevelColors(record.level);

  const handleClick = useCallback(() => {
    onToggle(expanded ? null : record.id);
  }, [expanded, onToggle, record.id]);

  return (
    <div>
      <button
        aria-expanded={expanded}
        data-lt-interactive=""
        data-testid="log-row"
        onClick={handleClick}
        style={{ ...rowStyle, background: expanded ? levelColors.bg : "transparent" }}
        type="button"
      >
        {/* Timestamp */}
        <span style={timestampStyle}>{formatTime(record.timestamp)}</span>

        {/* Level badge */}
        <LevelBadge level={record.level} />

        {/* Category */}
        <span style={categoryStyle}>{record.category.join(".")}</span>

        {/* Message */}
        <span style={messageStyle}>{record.messageText}</span>

        {/* Caller (right-aligned) */}
        {record.caller ? <span style={callerStyle}>{record.caller}</span> : null}

        {/* Expand indicator */}
        <span style={{ ...chevronStyle, transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}>
          <ChevronRightIcon size={12} />
        </span>
      </button>

      {expanded ? <LogDetail record={record} /> : null}
    </div>
  );
};
