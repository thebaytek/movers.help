"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, Truck } from "lucide-react";
import Link from "next/link";

const links = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Reviews", href: "#reviews" },
  { label: "3D Truck", href: "#truck-viewer" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-surface-200/60 dark:border-surface-800/60 shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Button asChild size="sm" variant="accent">
            <Link href="/login">Mover Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="#quote">Get a Quote</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-full"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-surface-950 border-b border-surface-200 dark:border-surface-800 animate-slide-down">
          <div className="px-4 py-4 space-y-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-surface-200 dark:border-surface-800 space-y-2">
              <Button asChild className="w-full" size="sm">
                <Link href="#quote" onClick={() => setMobileOpen(false)}>Get a Quote</Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href="/login" onClick={() => setMobileOpen(false)}>Mover Login</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
