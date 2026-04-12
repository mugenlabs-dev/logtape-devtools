import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";
import { AlertTriangle, RotateCcw } from "lucide-react";

export const ErrorPage = ({ error }: ErrorComponentProps) => {
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-red-500/15">
        <AlertTriangle className="text-red-400" size={28} />
      </div>
      <h1 className="mb-2 font-bold text-2xl text-text-primary">Something went wrong</h1>
      <p className="mb-6 text-text-muted">
        {error instanceof Error ? error.message : "An unexpected error occurred."}
      </p>
      <button
        className="flex items-center gap-2 rounded-lg bg-accent/15 px-5 py-2.5 font-semibold text-accent-light text-sm transition-colors hover:bg-accent/25"
        onClick={() => router.invalidate()}
        type="button"
      >
        <RotateCcw size={14} />
        Try again
      </button>
    </div>
  );
};
