"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const links = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "See It", href: "#see-it-in-action" },
  { label: "3D Truck", href: "#truck-viewer" },
  { label: "Reviews", href: "#reviews" },
  { label: "Scan", href: "/scan" },
];

const menuVariants = {
  closed: {
    opacity: 0,
    transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
  },
  open: {
    opacity: 1,
    transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
  },
};

const linkItem = (i: number) => ({
  closed: { opacity: 0, y: 24 },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: 0.08 + i * 0.05,
      ease: [0.32, 0.72, 0, 1],
    },
  },
});

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1], delay: 0.05 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 sm:px-6"
      >
        <nav
          className={cn(
            "mx-auto flex h-14 max-w-6xl items-center justify-between px-3 transition-colors duration-300 sm:px-4",
            "rounded-xl border",
            scrolled
              ? "border-white/10 bg-surface-950/85 backdrop-blur-xl"
              : "border-white/[0.06] bg-surface-950/50 backdrop-blur-md",
          )}
        >
          <div className="flex-shrink-0 pl-1">
            <Logo />
          </div>

          <div className="hidden items-center gap-0.5 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-[13px] font-medium text-surface-400 transition-colors hover:bg-white/[0.04] hover:text-surface-100"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 pr-1 md:flex">
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="rounded-lg text-surface-400 hover:text-surface-100"
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="sm" className="rounded-lg">
              <Link href="/scan">Try scan</Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 pr-1 md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06]"
              aria-label="Toggle menu"
            >
              <div className="relative flex h-3 w-4 flex-col justify-between">
                <motion.span
                  animate={mobileOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                  className="block h-px w-full origin-center bg-surface-300"
                />
                <motion.span
                  animate={mobileOpen ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="block h-px w-full bg-surface-300"
                />
                <motion.span
                  animate={mobileOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                  className="block h-px w-full origin-center bg-surface-300"
                />
              </div>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-surface-950/95 backdrop-blur-xl"
          >
            <nav className="flex flex-col items-center gap-1">
              {links.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  variants={linkItem(i)}
                  initial="closed"
                  animate="open"
                  className="px-8 py-3 font-display text-2xl font-semibold text-surface-300 transition-colors hover:text-[#76ff03]"
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.div
                variants={linkItem(links.length)}
                initial="closed"
                animate="open"
                className="mt-8 flex w-48 flex-col gap-3"
              >
                <Button asChild size="lg" className="w-full rounded-xl">
                  <Link href="/scan" onClick={() => setMobileOpen(false)}>
                    Try scan
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="w-full rounded-xl"
                >
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Mover Login
                  </Link>
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
