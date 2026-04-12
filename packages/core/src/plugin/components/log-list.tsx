import { useEffect, useRef } from "react";
import type { DevtoolsLogRecord } from "../../types";
import { theme } from "../theme";
import { LogRow } from "./log-row";

interface LogListProps {
  autoScroll: boolean;
  expandedId: string | null;
  onToggle: (id: string | null) => void;
  records: DevtoolsLogRecord[];
}

export const LogList = ({ records, expandedId, onToggle, autoScroll }: LogListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const recordCount = records.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: recordCount triggers scroll on new records
  useEffect(() => {
    const el = containerRef.current;
    if (!(el && autoScroll && isAtBottomRef.current)) {
      return;
    }
    el.scrollTop = el.scrollHeight;
  }, [autoScroll, recordCount]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    // Consider "at bottom" if within 40px of the end
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  };

  if (records.length === 0) {
    return (
      <div
        data-testid="log-list-empty"
        style={{
          alignItems: "center",
          color: theme.colors.textMuted,
          display: "flex",
          flex: 1,
          fontSize: theme.fontSize.lg,
          justifyContent: "center",
        }}
      >
        No logs yet
      </div>
    );
  }

  return (
    <div
      data-testid="log-list"
      onScroll={handleScroll}
      ref={containerRef}
      style={{
        flex: 1,
        overflow: "auto",
        scrollbarColor: `${theme.colors.scrollbar} transparent`,
        scrollbarWidth: "thin",
      }}
    >
      {records.map((record) => (
        <LogRow
          expanded={expandedId === record.id}
          key={record.id}
          onToggle={onToggle}
          record={record}
        />
      ))}
    </div>
  );
};
