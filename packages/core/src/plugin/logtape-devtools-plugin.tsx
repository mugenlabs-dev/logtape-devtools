import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import type { LogStore } from "../store";
import type { DevtoolsLogRecord, LogLevel } from "../types";
import { LogList } from "./components/log-list";
import { Toolbar } from "./components/toolbar";
import { theme } from "./theme";

interface Props {
  store: LogStore;
}

export const LogTapeDevtoolsPlugin = ({ store }: Props) => {
  const allRecords = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  const [paused, setPaused] = useState(false);
  const [pausedRecords, setPausedRecords] = useState<DevtoolsLogRecord[]>([]);
  const [levelFilter, setLevelFilter] = useState<Set<LogLevel>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handlePause = useCallback(() => {
    setPaused(true);
    setPausedRecords(store.getSnapshot());
  }, [store]);

  const handleResume = useCallback(() => {
    setPaused(false);
    setPausedRecords([]);
  }, []);

  const handleClear = useCallback(() => {
    store.clear();
    setPausedRecords([]);
    setExpandedId(null);
  }, [store]);

  const records = paused ? pausedRecords : allRecords;

  const uniqueCategories = useMemo(() => {
    const seen = new Set<string>();
    for (const r of records) {
      seen.add(r.category.join("."));
    }
    return Array.from(seen).sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (levelFilter.size > 0 && !levelFilter.has(r.level)) {
        return false;
      }
      if (categoryFilter.length > 0 && !categoryFilter.includes(r.category.join("."))) {
        return false;
      }
      if (searchText) {
        const term = searchText.toLowerCase();
        if (
          !(
            r.messageText.toLowerCase().includes(term) ||
            r.category.join(".").toLowerCase().includes(term)
          )
        ) {
          return false;
        }
      }
      return true;
    });
  }, [records, levelFilter, categoryFilter, searchText]);

  return (
    <div
      style={{
        background: theme.colors.background,
        color: theme.colors.textPrimary,
        display: "flex",
        flexDirection: "row",
        fontFamily: theme.fontFamily.sans,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          borderRight: sidebarOpen ? `1px solid ${theme.colors.border}` : "none",
          flexShrink: 0,
          opacity: sidebarOpen ? 1 : 0,
          overflow: "hidden",
          transition: "width 0.2s ease, opacity 0.15s ease",
          width: sidebarOpen ? "200px" : "0px",
        }}
      >
        <Toolbar
          categories={uniqueCategories}
          categoryFilter={categoryFilter}
          filteredCount={filteredRecords.length}
          levelFilter={levelFilter}
          onCategoryFilterChange={setCategoryFilter}
          onClear={handleClear}
          onLevelFilterChange={setLevelFilter}
          onPause={handlePause}
          onResume={handleResume}
          onSearchTextChange={setSearchText}
          paused={paused}
          searchText={searchText}
          totalCount={records.length}
        />
      </div>

      <div style={{ display: "flex", flex: 1, flexDirection: "column", overflow: "hidden" }}>
        {/* Sidebar toggle bar */}
        <div
          style={{
            alignItems: "center",
            borderBottom: `1px solid ${theme.colors.border}`,
            display: "flex",
            flexShrink: 0,
            gap: theme.spacing.lg,
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
          }}
        >
          <button
            aria-expanded={sidebarOpen}
            data-lt-clear-btn=""
            onClick={() => setSidebarOpen((v) => !v)}
            style={{
              background: "none",
              border: "none",
              color: theme.colors.textMuted,
              cursor: "pointer",
              fontFamily: theme.fontFamily.sans,
              fontSize: theme.fontSize.md,
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              transition: "color 0.1s",
            }}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            type="button"
          >
            {sidebarOpen ? "◀ Hide controls" : "▶ Show controls"}
          </button>

          {!sidebarOpen && (
            <>
              <span
                style={{
                  color: theme.colors.textMuted,
                  fontFamily: theme.fontFamily.mono,
                  fontSize: theme.fontSize.sm,
                }}
              >
                {filteredRecords.length === records.length
                  ? `${records.length} logs`
                  : `${filteredRecords.length} / ${records.length} logs`}
              </span>
              <button
                data-lt-interactive=""
                onClick={paused ? handleResume : handlePause}
                style={{
                  background: paused
                    ? theme.colors.levels.warning.badge
                    : theme.colors.surfaceHover,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radius.sm,
                  color: paused ? theme.colors.white : theme.colors.textPrimary,
                  cursor: "pointer",
                  fontFamily: theme.fontFamily.sans,
                  fontSize: theme.fontSize.sm,
                  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                  transition: "filter 0.1s",
                }}
                title={paused ? "Resume" : "Pause"}
                type="button"
              >
                {paused ? "▶" : "⏸"}
              </button>
              <button
                data-lt-interactive=""
                onClick={handleClear}
                style={{
                  background: theme.colors.surfaceHover,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radius.sm,
                  color: theme.colors.textPrimary,
                  cursor: "pointer",
                  fontFamily: theme.fontFamily.sans,
                  fontSize: theme.fontSize.sm,
                  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                  transition: "filter 0.1s",
                }}
                title="Clear"
                type="button"
              >
                ✕
              </button>
            </>
          )}
        </div>
        <LogList
          autoScroll={!paused}
          expandedId={expandedId}
          onToggle={setExpandedId}
          records={filteredRecords}
        />
      </div>
    </div>
  );
};
