import { useCallback, useEffect, useRef, useState } from "react";
import type { BundledLanguage, BundledTheme, HighlighterGeneric } from "shiki/bundle/web";
import { type AnimatedIconHandle, CheckIcon, CopyIcon } from "../icons";

// ---------------------------------------------------------------------------
// Shiki highlighter (loaded once, cached)
// ---------------------------------------------------------------------------
type WebHighlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;

let highlighterPromise: Promise<WebHighlighter> | null = null;

// The web bundle only carries browser-relevant grammars, and the dynamic
// import keeps shiki out of the initial landing-page chunk.
const getHighlighter = () => {
  highlighterPromise ??= import("shiki/bundle/web").then(({ createHighlighter }) =>
    createHighlighter({
      langs: ["typescript", "tsx", "bash"],
      themes: ["github-dark"],
    })
  );
  return highlighterPromise;
};

// ---------------------------------------------------------------------------
// WindowDots — macOS traffic-light dots (decorative)
// ---------------------------------------------------------------------------
const dotColors = ["#ff5f56", "#ffbd2e", "#27c93f"] as const;

const WindowDots = () => (
  <div style={{ alignItems: "center", display: "flex", gap: 6 }}>
    {dotColors.map((color) => (
      <div
        key={color}
        style={{
          background: color,
          borderRadius: "50%",
          height: 10,
          width: 10,
        }}
      />
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// CopyButton — copies text to clipboard with check feedback
// ---------------------------------------------------------------------------
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iconRef = useRef<AnimatedIconHandle>(null);

  useEffect(
    () => () => {
      if (resetTimerRef.current != null) {
        clearTimeout(resetTimerRef.current);
      }
    },
    []
  );

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    if (resetTimerRef.current != null) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [text]);

  const handleMouseEnter = useCallback(() => {
    iconRef.current?.startAnimation();
  }, []);

  const handleMouseLeave = useCallback(() => {
    iconRef.current?.stopAnimation();
  }, []);

  return (
    <button
      aria-label="Copy code"
      className="lt-control lt-hit-44"
      onClick={handleCopy}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        alignItems: "center",
        background: copied ? "rgba(74, 222, 128, 0.15)" : "rgba(255,255,255,0.06)",
        border: "1px solid",
        borderColor: copied ? "rgba(74, 222, 128, 0.3)" : "rgba(255,255,255,0.1)",
        borderRadius: 6,
        color: copied ? "var(--accent-green)" : "var(--text-muted)",
        cursor: "pointer",
        display: "flex",
        insetBlockStart: 10,
        insetInlineEnd: 10,
        justifyContent: "center",
        opacity: copied ? 1 : 0.75,
        padding: "5px 6px",
        position: "absolute",
        transition:
          "opacity var(--duration-fast) var(--ease-out), background-color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)",
      }}
      type="button"
    >
      {copied ? <CheckIcon ref={iconRef} size={14} /> : <CopyIcon ref={iconRef} size={14} />}
    </button>
  );
};

// ---------------------------------------------------------------------------
// CodeBlock — async syntax-highlighted code with copy button
// ---------------------------------------------------------------------------
export const CodeBlock = ({
  code,
  lang = "tsx",
}: {
  code: string;
  lang?: "typescript" | "tsx" | "bash";
}) => {
  const [html, setHtml] = useState<string | null>(null);
  const trimmed = code.trim();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const hl = await getHighlighter();
      if (cancelled) {
        return;
      }
      setHtml(hl.codeToHtml(trimmed, { lang, theme: "github-dark" }));
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [trimmed, lang]);

  return (
    <div
      style={{
        background: "var(--code-block-bg)",
        border: "1px solid var(--border-secondary)",
        borderRadius: 12,
        boxShadow: "0 20px 40px -20px rgba(0,0,0,0.5)",
        overflow: "clip",
        position: "relative",
      }}
    >
      <div
        style={{
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.02)",
          borderBottom: "1px solid var(--border-secondary)",
          display: "flex",
          gap: 6,
          paddingBlock: 12,
          paddingInline: 16,
        }}
      >
        <WindowDots />
        <span
          style={{
            color: "var(--text-dimmed)",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 12,
            marginInlineStart: "auto",
          }}
        >
          {lang}
        </span>
      </div>
      <div className="lt-scroll-x" style={{ position: "relative" }}>
        <CopyButton text={trimmed} />
        {html == null ? (
          <pre
            style={{
              background: "transparent",
              color: "var(--text-secondary)",
              fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
              fontSize: 13,
              lineHeight: 1.6,
              margin: 0,
              paddingBlock: 16,
              paddingInline: 20,
            }}
          >
            <code>
              {trimmed.split("\n").map((line, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: stable ordered lines
                <span className="line" key={i}>
                  {line}
                  {"\n"}
                </span>
              ))}
            </code>
          </pre>
        ) : (
          <div
            className="shiki-wrapper"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output
            dangerouslySetInnerHTML={{ __html: html }}
            style={{ fontSize: 13, lineHeight: 1.6 }}
          />
        )}
      </div>
    </div>
  );
};
