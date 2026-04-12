import type { DevtoolsLogRecord } from "../../types";
import { theme } from "../theme";

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function safeStringify(value: unknown, indent = 2): string {
  try {
    return JSON.stringify(value, null, indent);
  } catch {
    return String(value);
  }
}

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: "flex", gap: theme.spacing.lg, marginBottom: theme.spacing.md }}>
    <span
      style={{
        color: theme.colors.textMuted,
        flexShrink: 0,
        fontSize: theme.fontSize.md,
        minWidth: "72px",
        textAlign: "right",
      }}
    >
      {label}
    </span>
    <span style={{ fontSize: theme.fontSize.base, wordBreak: "break-all" }}>{children}</span>
  </div>
);

export const LogDetail = ({ record }: { record: DevtoolsLogRecord }) => {
  const levelColors = theme.colors.levels[record.level];
  const hasProperties = Object.keys(record.properties).length > 0;

  return (
    <div
      data-testid="log-detail"
      style={{
        background: levelColors.bg,
        borderTop: `1px solid ${theme.colors.border}`,
        padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
      }}
    >
      <DetailRow label="Time">{formatTimestamp(record.timestamp)}</DetailRow>
      <DetailRow label="Level">
        <span style={{ color: levelColors.color, fontWeight: 600 }}>{record.level}</span>
      </DetailRow>
      <DetailRow label="Category">
        <span style={{ color: theme.colors.accent, fontFamily: theme.fontFamily.mono }}>
          {record.category.join(".")}
        </span>
      </DetailRow>
      {record.caller && (
        <DetailRow label="Caller">
          <span style={{ color: theme.colors.textSecondary, fontFamily: theme.fontFamily.mono }}>
            {record.caller}
          </span>
        </DetailRow>
      )}
      <DetailRow label="Message">
        <span style={{ color: theme.colors.textPrimary }}>{record.messageText}</span>
      </DetailRow>

      {hasProperties && (
        <DetailRow label="Data">
          <pre
            style={{
              background: "rgba(0,0,0,0.3)",
              borderRadius: theme.radius.md,
              color: theme.colors.textPrimary,
              fontFamily: theme.fontFamily.mono,
              fontSize: theme.fontSize.md,
              margin: 0,
              maxHeight: "200px",
              overflow: "auto",
              padding: theme.spacing.lg,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {safeStringify(record.properties)}
          </pre>
        </DetailRow>
      )}
    </div>
  );
};
