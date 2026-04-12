import { createContext, type ReactNode, useCallback, useContext, useState } from "react";

export const MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const;
export type PM = (typeof MANAGERS)[number];

const STORAGE_KEY = "logtape-devtools:pm";

function readStoredPm(): PM {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value && (MANAGERS as readonly string[]).includes(value)) {
      return value as PM;
    }
  } catch {
    // Storage unavailable
  }
  return "pnpm";
}

interface PmContextValue {
  pm: PM;
  setPm: (pm: PM) => void;
}

const PmContext = createContext<PmContextValue | null>(null);

export const PmProvider = ({ children }: { children: ReactNode }) => {
  const [pm, setPmState] = useState<PM>(readStoredPm);

  const setPm = useCallback((next: PM) => {
    setPmState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable
    }
  }, []);

  return <PmContext.Provider value={{ pm, setPm }}>{children}</PmContext.Provider>;
};

export const usePm = (): PmContextValue => {
  const ctx = useContext(PmContext);
  if (!ctx) {
    throw new Error("usePm must be used within a PmProvider");
  }
  return ctx;
};
