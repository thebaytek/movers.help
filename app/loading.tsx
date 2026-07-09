export default function Loading() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 animate-pulse" />
        <p className="text-sm text-surface-500 dark:text-surface-400 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
