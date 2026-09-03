import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useRef } from "react";
import type { DevtoolsLogRecord } from "../../types";
import { theme } from "../theme";
import { LogRow } from "./log-row";

interface LogListProps {
  autoScroll: boolean;
  expandedId: string | null;
  onToggle: (id: string | null) => void;
  records: DevtoolsLogRecord[];
}

/** Collapsed row height — rows are measured after mount, this is only the seed. */
const ESTIMATED_ROW_HEIGHT = 28;
const OVERSCAN = 10;
/** Distance from the bottom (px) still considered "stuck to the bottom". */
const STICK_THRESHOLD = 40;

const emptyStyle = {
  alignItems: "center",
  color: theme.colors.textMuted,
  display: "flex",
  flex: 1,
  fontSize: theme.fontSize.lg,
  justifyContent: "center",
} as const;

const containerStyle = {
  flex: 1,
  overflow: "auto",
  scrollbarColor: `${theme.colors.scrollbar} transparent`,
  scrollbarWidth: "thin",
} as const;

export const LogList = ({ records, expandedId, onToggle, autoScroll }: LogListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const virtualizer = useVirtualizer({
    count: records.length,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    // The virtualizer can ask for keys of indices from a previous, longer list
    // (after clear or a narrowing filter), so never assume the index exists.
    getItemKey: (index) => records[index]?.id ?? index,
    getScrollElement: () => containerRef.current,
    overscan: OVERSCAN,
  });

  const recordCount = records.length;
  // Key on the newest record rather than the count: once the ring buffer is
  // full the count stays constant while the contents keep changing.
  const lastRecordId = records[recordCount - 1]?.id;
  useEffect(() => {
    if (lastRecordId === undefined || !(autoScroll && isAtBottomRef.current)) {
      return;
    }
    virtualizer.scrollToIndex(recordCount - 1, { align: "end" });
  }, [autoScroll, lastRecordId, recordCount, virtualizer]);

  // The scroll container unmounts while the list is empty; treat the next
  // batch of logs as a fresh start instead of keeping a stale "scrolled up".
  useEffect(() => {
    if (recordCount === 0) {
      isAtBottomRef.current = true;
    }
  }, [recordCount]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD;
  }, []);

  if (records.length === 0) {
    return (
      <div data-testid="log-list-empty" style={emptyStyle}>
        No logs yet
      </div>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div data-testid="log-list" onScroll={handleScroll} ref={containerRef} style={containerStyle}>
      {/* Spacer sized to the full list, with only the visible window rendered */}
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            left: 0,
            position: "absolute",
            top: 0,
            transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
            width: "100%",
          }}
        >
          {virtualItems.map((virtualItem) => {
            const record = records[virtualItem.index];
            return (
              <div
                data-index={virtualItem.index}
                key={virtualItem.key}
                ref={virtualizer.measureElement}
              >
                <LogRow expanded={expandedId === record.id} onToggle={onToggle} record={record} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
