import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Settings, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "./signout-button";

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single() as { data: { full_name: string | null; company_name: string | null } | null };

  const displayName = profile?.full_name || "Mover";
  const displayCompany = profile?.company_name || user.email;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 z-40 h-full w-64 border-r border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hidden lg:flex flex-col">
        <div className="p-6 border-b border-surface-200 dark:border-surface-800">
          <Logo />
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-surface-200 dark:border-surface-800 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
              {displayName.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                {displayName}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
                {displayCompany}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 border-b border-surface-200 dark:border-surface-800 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl px-4 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
