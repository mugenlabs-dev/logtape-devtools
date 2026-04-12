import { SiBun, SiNpm, SiPnpm, SiYarn } from "@icons-pack/react-simple-icons";
import { Check, Copy } from "lucide-react";
import { type ComponentType, useCallback, useState } from "react";
import { MANAGERS, type PM, usePm } from "./pm-context";

const pmIcons: Record<PM, ComponentType<{ size: number; color: string }>> = {
  bun: SiBun,
  npm: SiNpm,
  pnpm: SiPnpm,
  yarn: SiYarn,
};

function getCommand(pm: PM, packages: string, dev: boolean): string {
  const flag = dev ? " -D" : "";
  switch (pm) {
    case "pnpm":
      return `pnpm add${flag} ${packages}`;
    case "npm":
      return `npm install${flag} ${packages}`;
    case "yarn":
      return `yarn add${flag} ${packages}`;
    case "bun":
      return `bun add${flag} ${packages}`;
    default:
      return `npm install${flag} ${packages}`;
  }
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }, [text]);

  return (
    <button
      className="flex items-center justify-center rounded-md p-1.5 text-text-dimmed transition-colors hover:bg-white/10 hover:text-text-primary"
      onClick={handleCopy}
      title="Copy to clipboard"
      type="button"
    >
      {copied ? <Check className="text-accent-green" size={14} /> : <Copy size={14} />}
    </button>
  );
};

export const InstallBlock = ({ dev = true, packages }: { dev?: boolean; packages: string }) => {
  const { pm, setPm } = usePm();
  const command = getCommand(pm, packages, dev);

  return (
    <div className="overflow-hidden rounded-lg border border-border-secondary">
      <div className="flex border-border-secondary border-b bg-bg-tertiary">
        {MANAGERS.map((m) => {
          const Icon = pmIcons[m];
          const active = pm === m;
          return (
            <button
              className={`flex items-center gap-1.5 px-4 py-2 font-medium text-sm transition-colors ${
                active
                  ? "border-accent border-b-2 text-accent-light"
                  : "text-text-muted hover:text-text-primary"
              }`}
              key={m}
              onClick={() => setPm(m)}
              type="button"
            >
              <Icon color="currentColor" size={14} />
              {m}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between bg-code-block-bg px-4 py-3">
        <code className="font-mono text-accent-green text-sm">{command}</code>
        <CopyButton text={command} />
      </div>
    </div>
  );
};
