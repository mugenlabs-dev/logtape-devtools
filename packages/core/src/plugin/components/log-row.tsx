import { useCallback } from "react";
import type { DevtoolsLogRecord } from "../../types";
import { theme } from "../theme";
import { LevelBadge } from "./level-badge";
import { LogDetail } from "./log-detail";

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

interface LogRowProps {
  expanded: boolean;
  onToggle: (id: string | null) => void;
  record: DevtoolsLogRecord;
}

export const LogRow = ({ record, expanded, onToggle }: LogRowProps) => {
  const levelColors = theme.colors.levels[record.level];

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
        style={{
          alignItems: "center",
          background: expanded ? levelColors.bg : "transparent",
          border: "none",
          borderBottom: `1px solid ${theme.colors.border}`,
          cursor: "pointer",
          display: "flex",
          gap: theme.spacing.lg,
          padding: `${theme.spacing.md} ${theme.spacing.xl}`,
          textAlign: "left",
          transition: "background 0.1s, filter 0.1s",
          width: "100%",
        }}
        type="button"
      >
        {/* Timestamp */}
        <span
          style={{
            color: theme.colors.textDimmed,
            flexShrink: 0,
            fontFamily: theme.fontFamily.mono,
            fontSize: theme.fontSize.md,
          }}
        >
          {formatTime(record.timestamp)}
        </span>

        {/* Level badge */}
        <LevelBadge level={record.level} />

        {/* Category */}
        <span
          style={{
            color: theme.colors.accent,
            flexShrink: 0,
            fontFamily: theme.fontFamily.mono,
            fontSize: theme.fontSize.md,
            maxWidth: "180px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {record.category.join(".")}
        </span>

        {/* Message */}
        <span
          style={{
            color: theme.colors.textPrimary,
            flex: 1,
            fontSize: theme.fontSize.base,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {record.messageText}
        </span>

        {/* Caller (right-aligned) */}
        {record.caller && (
          <span
            style={{
              color: theme.colors.textDimmed,
              flexShrink: 0,
              fontFamily: theme.fontFamily.mono,
              fontSize: theme.fontSize.sm,
              maxWidth: "200px",
              opacity: 0.7,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {record.caller}
          </span>
        )}

        {/* Expand indicator */}
        <span
          style={{
            color: theme.colors.textDimmed,
            flexShrink: 0,
            fontSize: theme.fontSize.sm,
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        >
          ▶
        </span>
      </button>

      {expanded && <LogDetail record={record} />}
    </div>
  );
};
