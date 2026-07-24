import { safeStringify } from "../../safe-json";
import type { DevtoolsLogRecord } from "../../types";
import { formatTime } from "../format";
import { theme } from "../theme";

const detailRowStyle = {
  display: "flex",
  gap: theme.spacing.lg,
  marginBottom: theme.spacing.md,
} as const;

const detailLabelStyle = {
  color: theme.colors.textMuted,
  flexShrink: 0,
  fontSize: theme.fontSize.md,
  minWidth: "72px",
  textAlign: "right",
} as const;

const detailValueStyle = {
  fontSize: theme.fontSize.base,
  wordBreak: "break-all",
} as const;

const containerStyle = {
  borderTop: `1px solid ${theme.colors.border}`,
  padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
} as const;

const categoryStyle = {
  color: theme.colors.accent,
  fontFamily: theme.fontFamily.mono,
} as const;

const callerStyle = {
  color: theme.colors.textSecondary,
  fontFamily: theme.fontFamily.mono,
} as const;

const messageStyle = { color: theme.colors.textPrimary } as const;

const propertiesStyle = {
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
} as const;

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={detailRowStyle}>
    <span style={detailLabelStyle}>{label}</span>
    <span style={detailValueStyle}>{children}</span>
  </div>
);

export const LogDetail = ({ record }: { record: DevtoolsLogRecord }) => {
  const levelColors = theme.colors.levels[record.level];
  const hasProperties = Object.keys(record.properties).length > 0;

  return (
    <div data-testid="log-detail" style={{ ...containerStyle, background: levelColors.bg }}>
      <DetailRow label="Time">{formatTime(record.timestamp)}</DetailRow>
      <DetailRow label="Level">
        <span style={{ color: levelColors.color, fontWeight: 600 }}>{record.level}</span>
      </DetailRow>
      <DetailRow label="Category">
        <span style={categoryStyle}>{record.category.join(".")}</span>
      </DetailRow>
      {record.caller && (
        <DetailRow label="Caller">
          <span style={callerStyle}>{record.caller}</span>
        </DetailRow>
      )}
      <DetailRow label="Message">
        <span style={messageStyle}>{record.messageText}</span>
      </DetailRow>

      {hasProperties && (
        <DetailRow label="Data">
          <pre style={propertiesStyle}>{safeStringify(record.properties, 2)}</pre>
        </DetailRow>
      )}
    </div>
  );
};
