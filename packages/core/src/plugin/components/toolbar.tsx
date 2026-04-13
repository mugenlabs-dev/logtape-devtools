import { Combobox } from "@base-ui-components/react/combobox";
import { Popover } from "@base-ui-components/react/popover";
import { Debouncer } from "@tanstack/pacer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LOG_LEVELS, type LogLevel } from "../../types";
import { CheckIcon, PauseIcon, PlayIcon, Trash2Icon, XIcon } from "../icons";
import { theme } from "../theme";

interface ToolbarProps {
  categories: string[];
  categoryFilter: string[];
  filteredCount: number;
  levelFilter: Set<LogLevel>;
  onCategoryFilterChange: (value: string[]) => void;
  onClear: () => void;
  onLevelFilterChange: (levels: Set<LogLevel>) => void;
  onPause: () => void;
  onResume: () => void;
  onSearchTextChange: (value: string) => void;
  paused: boolean;
  searchText: string;
  totalCount: number;
}

// Inject hover styles once (scoped via data attribute to avoid leaking)
const HOVER_STYLE_ID = "logtape-devtools-hover";
function useHoverStyles() {
  useEffect(() => {
    if (document.getElementById(HOVER_STYLE_ID)) {
      return;
    }
    const style = document.createElement("style");
    style.id = HOVER_STYLE_ID;
    style.textContent = `
      [data-lt-interactive]:hover {
        filter: brightness(1.25);
      }
      [data-lt-interactive]:active {
        filter: brightness(0.9);
      }
      [data-lt-clear-btn]:hover {
        color: ${theme.colors.textPrimary} !important;
      }
      [data-lt-chip-remove]:hover {
        opacity: 1 !important;
        color: ${theme.colors.white} !important;
      }
    `;
    document.head.appendChild(style);
  }, []);
}

const buttonStyle = {
  background: theme.colors.surfaceHover,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.md,
  color: theme.colors.textPrimary,
  cursor: "pointer",
  fontFamily: theme.fontFamily.sans,
  fontSize: theme.fontSize.md,
  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
  transition: "filter 0.1s, background 0.1s, border-color 0.1s",
  width: "100%",
} as const;

const inputStyle = {
  background: theme.colors.surface,
  border: `1px solid ${theme.colors.borderInput}`,
  borderRadius: theme.radius.md,
  color: theme.colors.textPrimary,
  fontFamily: theme.fontFamily.sans,
  fontSize: theme.fontSize.md,
  outline: "none",
  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
  transition: "border-color 0.15s",
  width: "100%",
} as const;

const sectionLabelStyle = {
  color: theme.colors.textMuted,
  fontSize: "9px",
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
} as const;

const LevelToggle = ({
  level,
  active,
  onToggle,
}: {
  level: LogLevel;
  active: boolean;
  onToggle: (level: LogLevel) => void;
}) => {
  const colors = theme.colors.levels[level];
  const handleClick = useCallback(() => onToggle(level), [level, onToggle]);

  return (
    <button
      aria-pressed={active}
      data-lt-interactive=""
      data-testid={`level-toggle-${level}`}
      onClick={handleClick}
      style={{
        background: active ? colors.badge : "transparent",
        border: `1px solid ${active ? colors.badge : theme.colors.border}`,
        borderRadius: theme.radius.sm,
        color: active ? theme.colors.white : colors.color,
        cursor: "pointer",
        fontFamily: theme.fontFamily.mono,
        fontSize: theme.fontSize.sm,
        fontWeight: 600,
        lineHeight: 1,
        minWidth: "30px",
        opacity: active ? 1 : 0.5,
        padding: "3px 0",
        textAlign: "center" as const,
        transition: "all 0.15s",
      }}
      title={`Filter ${level} logs`}
      type="button"
    >
      {level.slice(0, 3).toUpperCase()}
    </button>
  );
};

export const Toolbar = ({
  paused,
  onPause,
  onResume,
  onClear,
  levelFilter,
  onLevelFilterChange,
  categories,
  categoryFilter,
  onCategoryFilterChange,
  searchText,
  onSearchTextChange,
  totalCount,
  filteredCount,
}: ToolbarProps) => {
  useHoverStyles();

  const [localSearch, setLocalSearch] = useState(searchText);
  const debouncedSearch = useMemo(
    () => new Debouncer(onSearchTextChange, { wait: 200 }),
    [onSearchTextChange]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalSearch(value);
      debouncedSearch.maybeExecute(value);
    },
    [debouncedSearch]
  );

  // Sync local state when parent clears search
  useEffect(() => {
    if (searchText === "" && localSearch !== "") {
      setLocalSearch("");
    }
  }, [searchText, localSearch]);

  const handleLevelToggle = useCallback(
    (level: LogLevel) => {
      const next = new Set(levelFilter);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      onLevelFilterChange(next);
    },
    [levelFilter, onLevelFilterChange]
  );

  return (
    <div
      data-testid="toolbar"
      style={{
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        gap: theme.spacing.xl,
        height: "100%",
        minWidth: "200px",
        overflow: "auto",
        padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
      }}
    >
      {/* Log count */}
      <div style={{ textAlign: "center" }}>
        <span
          style={{
            color: theme.colors.textPrimary,
            fontFamily: theme.fontFamily.mono,
            fontSize: theme.fontSize.lg,
            fontWeight: 600,
          }}
        >
          {filteredCount === totalCount ? `${totalCount}` : `${filteredCount} / ${totalCount}`}
        </span>
        <div style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm }}>logs</div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
        <div style={sectionLabelStyle}>Actions</div>
        <button
          data-lt-interactive=""
          onClick={paused ? onResume : onPause}
          style={{
            ...buttonStyle,
            background: paused ? theme.colors.levels.warning.badge : buttonStyle.background,
            color: paused ? theme.colors.white : buttonStyle.color,
          }}
          title={paused ? "Resume live updates" : "Pause live updates"}
          type="button"
        >
          <span style={{ alignItems: "center", display: "inline-flex", gap: "6px" }}>
            {paused ? <PlayIcon size={12} /> : <PauseIcon size={12} />}
            {paused ? "Resume" : "Pause"}
          </span>
        </button>

        <button
          data-lt-interactive=""
          onClick={onClear}
          style={buttonStyle}
          title="Clear all logs"
          type="button"
        >
          <span style={{ alignItems: "center", display: "inline-flex", gap: "6px" }}>
            <Trash2Icon size={12} />
            Clear
          </span>
        </button>
      </div>

      {/* Level filters */}
      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
        <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
          <div style={sectionLabelStyle}>Levels</div>
          {levelFilter.size > 0 && (
            <button
              data-lt-clear-btn=""
              onClick={() => onLevelFilterChange(new Set())}
              style={{
                background: "none",
                border: "none",
                color: theme.colors.textMuted,
                cursor: "pointer",
                fontSize: "9px",
                padding: 0,
                transition: "color 0.1s",
              }}
              title="Show all levels"
              type="button"
            >
              clear
            </button>
          )}
        </div>
        <div
          style={{
            display: "grid",
            gap: theme.spacing.xs,
            gridTemplateColumns: "repeat(3, 1fr)",
          }}
        >
          {LOG_LEVELS.map((level) => (
            <LevelToggle
              active={levelFilter.size === 0 || levelFilter.has(level)}
              key={level}
              level={level}
              onToggle={handleLevelToggle}
            />
          ))}
        </div>
      </div>

      {/* Category filter (multi-select combobox) */}
      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
        <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
          <div style={sectionLabelStyle}>Category</div>
          {categoryFilter.length > 0 && (
            <button
              data-lt-clear-btn=""
              onClick={() => onCategoryFilterChange([])}
              style={{
                background: "none",
                border: "none",
                color: theme.colors.textMuted,
                cursor: "pointer",
                fontSize: "9px",
                padding: 0,
                transition: "color 0.1s",
              }}
              title="Clear all categories"
              type="button"
            >
              clear
            </button>
          )}
        </div>
        {categories.length === 0 ? (
          <Popover.Root>
            <Popover.Trigger
              delay={300}
              nativeButton={false}
              openOnHover
              render={
                <div
                  data-testid="category-input"
                  style={{
                    ...inputStyle,
                    color: theme.colors.textMuted,
                    cursor: "not-allowed",
                    opacity: 0.5,
                  }}
                >
                  Category…
                </div>
              }
            />
            <Popover.Portal>
              <Popover.Positioner sideOffset={6} style={{ zIndex: 999_999 }}>
                <Popover.Popup
                  style={{
                    background: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.radius.md,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    fontSize: theme.fontSize.sm,
                    maxWidth: "200px",
                    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                  }}
                >
                  <p style={{ color: theme.colors.textMuted, lineHeight: 1.4, margin: 0 }}>
                    Waiting for logs to populate available categories.
                  </p>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        ) : (
          <Combobox.Root
            items={categories}
            multiple
            onValueChange={onCategoryFilterChange}
            value={categoryFilter}
          >
            <div
              style={{
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.borderInput}`,
                borderRadius: theme.radius.md,
                display: "flex",
                flexWrap: "wrap",
                gap: "3px",
                minHeight: "28px",
                padding: "3px",
                transition: "border-color 0.15s",
              }}
            >
              {categoryFilter.map((cat) => (
                <span
                  key={cat}
                  style={{
                    alignItems: "center",
                    background: "rgba(99, 102, 241, 0.15)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    borderRadius: theme.radius.sm,
                    color: theme.colors.accentHover,
                    display: "inline-flex",
                    fontFamily: theme.fontFamily.mono,
                    fontSize: "9px",
                    gap: "3px",
                    lineHeight: 1,
                    padding: "1px 4px",
                  }}
                >
                  {cat}
                  <button
                    data-lt-chip-remove=""
                    onClick={() => onCategoryFilterChange(categoryFilter.filter((c) => c !== cat))}
                    style={{
                      background: "none",
                      border: "none",
                      color: theme.colors.textMuted,
                      cursor: "pointer",
                      fontSize: "7px",
                      lineHeight: 1,
                      opacity: 0.7,
                      padding: 0,
                      transition: "color 0.1s, opacity 0.1s",
                    }}
                    title={`Remove ${cat}`}
                    type="button"
                  >
                    <XIcon size={7} />
                  </button>
                </span>
              ))}
              <Combobox.Input
                data-testid="category-input"
                placeholder={categoryFilter.length === 0 ? "Category…" : ""}
                style={{
                  background: "transparent",
                  border: "none",
                  color: theme.colors.textPrimary,
                  flex: 1,
                  fontFamily: theme.fontFamily.sans,
                  fontSize: theme.fontSize.md,
                  minWidth: "40px",
                  outline: "none",
                  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                }}
              />
            </div>
            <Combobox.Portal>
              <Combobox.Positioner style={{ zIndex: 999_999 }}>
                <Combobox.Popup
                  style={{
                    background: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.radius.md,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    maxHeight: "200px",
                    overflow: "auto",
                    padding: theme.spacing.xs,
                  }}
                >
                  <Combobox.List>
                    {(item, index) => (
                      <Combobox.Item
                        index={index}
                        key={String(item)}
                        style={{
                          alignItems: "center",
                          borderRadius: theme.radius.sm,
                          color: theme.colors.textPrimary,
                          cursor: "pointer",
                          display: "flex",
                          fontFamily: theme.fontFamily.mono,
                          fontSize: theme.fontSize.md,
                          gap: theme.spacing.sm,
                          justifyContent: "space-between",
                          padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                          transition: "background 0.1s",
                        }}
                        value={item}
                      >
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {String(item)}
                        </span>
                        <Combobox.ItemIndicator>
                          <CheckIcon color={theme.colors.accent} size={14} />
                        </Combobox.ItemIndicator>
                      </Combobox.Item>
                    )}
                  </Combobox.List>
                </Combobox.Popup>
              </Combobox.Positioner>
            </Combobox.Portal>
          </Combobox.Root>
        )}
      </div>

      {/* Text search */}
      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
        <div style={sectionLabelStyle}>Search</div>
        <input
          data-testid="search-input"
          onChange={handleSearchChange}
          placeholder="Search…"
          style={inputStyle}
          type="text"
          value={localSearch}
        />
      </div>
    </div>
  );
};
