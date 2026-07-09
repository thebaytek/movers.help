import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 bg-grid">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
