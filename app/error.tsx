"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2 font-[family-name:var(--font-display)]">
          Something went wrong
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button onClick={reset} variant="accent">
          Try Again
        </Button>
      </div>
    </div>
  );
}
