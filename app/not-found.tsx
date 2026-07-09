import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
          <Truck className="w-10 h-10 text-surface-400" />
        </div>
        <h1 className="text-6xl font-bold text-surface-200 dark:text-surface-700 mb-4 font-[family-name:var(--font-display)]">
          404
        </h1>
        <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-2 font-[family-name:var(--font-display)]">
          Page not found
        </h2>
        <p className="text-surface-500 dark:text-surface-400 mb-6">
          This moving truck took a wrong turn. Let&apos;s get you back on route.
        </p>
        <Button asChild variant="accent">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
