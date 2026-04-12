import { Check, Copy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Highlighter } from "shiki";
import { createHighlighter } from "shiki";

// ---------------------------------------------------------------------------
// Shiki highlighter (loaded once, cached)
// ---------------------------------------------------------------------------
let highlighterPromise: Promise<Highlighter> | null = null;

const getHighlighter = () => {
  highlighterPromise ??= createHighlighter({
    langs: ["typescript", "tsx", "bash"],
    themes: ["github-dark"],
  });
  return highlighterPromise;
};

// ---------------------------------------------------------------------------
// Global style injection (once) — fixes shiki pre styling
// ---------------------------------------------------------------------------
let stylesInjected = false;
const injectShikiStyles = () => {
  if (stylesInjected) {
    return;
  }
  stylesInjected = true;
  const style = document.createElement("style");
  style.textContent = `
		.shiki-wrapper pre.shiki {
			margin: 0 !important;
			padding: 16px 20px !important;
			border-radius: 0 !important;
			background: var(--code-block-bg) !important;
			overflow-x: auto !important;
			counter-reset: line;
		}
		.shiki-wrapper code {
			font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace !important;
		}
		.shiki-wrapper .line::before {
			counter-increment: line;
			content: counter(line);
			display: inline-block;
			width: 2ch;
			margin-right: 1.5ch;
			text-align: right;
			color: rgba(255, 255, 255, 0.2);
			user-select: none;
			-webkit-user-select: none;
		}
	`;
  document.head.append(style);
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

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!copied) {
        e.currentTarget.style.opacity = "1";
      }
    },
    [copied]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!copied) {
        e.currentTarget.style.opacity = "0.6";
      }
    },
    [copied]
  );

  return (
    <button
      aria-label="Copy code"
      onClick={handleCopy}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        alignItems: "center",
        background: copied ? "rgba(74, 222, 128, 0.15)" : "rgba(255,255,255,0.06)",
        border: "1px solid",
        borderColor: copied ? "rgba(74, 222, 128, 0.3)" : "rgba(255,255,255,0.1)",
        borderRadius: 6,
        color: copied ? "var(--accent-green)" : "#888",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        opacity: copied ? 1 : 0.6,
        padding: "5px 6px",
        position: "absolute",
        right: 10,
        top: 10,
        transition: "all 0.15s",
      }}
      type="button"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
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
    injectShikiStyles();
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
        overflow: "hidden",
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
          padding: "12px 16px",
        }}
      >
        <WindowDots />
        <span
          style={{
            color: "var(--text-dimmed)",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 12,
            marginLeft: "auto",
          }}
        >
          {lang}
        </span>
      </div>
      <div style={{ position: "relative" }}>
        <CopyButton text={trimmed} />
        {html == null ? (
          <pre
            style={{
              background: "transparent",
              color: "#e0e0e0",
              fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
              fontSize: 13,
              lineHeight: 1.6,
              margin: 0,
              padding: "16px 20px",
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
