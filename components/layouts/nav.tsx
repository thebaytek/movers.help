"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const links = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Reviews", href: "#reviews" },
  { label: "3D Truck", href: "#truck-viewer" },
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
  closed: { opacity: 0, y: 24, filter: "blur(8px)" },
  open: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      delay: 0.08 + i * 0.06,
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

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Floating glass pill */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
        className={cn(
          "fixed top-0 left-1/2 -translate-x-1/2 z-50 mt-5 transition-all duration-500",
          scrolled
            ? "w-[min(95vw,72rem)]"
            : "w-[min(92vw,64rem)]"
        )}
      >
        <nav
          className={cn(
            "flex items-center justify-between h-14 px-4 transition-all duration-500",
            "rounded-full",
            scrolled
              ? "bg-surface-950/70 backdrop-blur-2xl border border-[#76ff03]/8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              : "bg-surface-950/40 backdrop-blur-xl border border-white/[0.05]"
          )}
        >
          <div className="flex-shrink-0 pl-1">
            <Logo />
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-[13px] font-medium text-surface-400 hover:text-[#76ff03] rounded-full hover:bg-white/[0.06] transition-all duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 pr-1">
            <ThemeToggle />
            <div className="h-5 w-px bg-white/[0.08]" />
            <Button asChild size="sm" variant="ghost" className="rounded-full text-surface-400 hover:text-[#76ff03]">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full">
              <Link href="#quote">Get a Quote</Link>
            </Button>
          </div>

          {/* Mobile toggle — morphing hamburger */}
          <div className="flex md:hidden items-center gap-2 pr-1">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="relative w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <div className="w-4 h-3 relative flex flex-col justify-between">
                <motion.span
                  animate={mobileOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                  className="block h-px w-full bg-surface-300 origin-center"
                />
                <motion.span
                  animate={mobileOpen ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="block h-px w-full bg-surface-300"
                />
                <motion.span
                  animate={mobileOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                  className="block h-px w-full bg-surface-300 origin-center"
                />
              </div>
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-40 bg-surface-950/90 backdrop-blur-3xl flex flex-col items-center justify-center"
          >
            <nav className="flex flex-col items-center gap-2">
              {links.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  variants={linkItem(i)}
                  initial="closed"
                  animate="open"
                  className="text-2xl font-display font-semibold text-surface-300 hover:text-[#76ff03] transition-colors duration-300 py-3 px-8"
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.div
                variants={linkItem(links.length)}
                initial="closed"
                animate="open"
                className="mt-8 flex flex-col gap-3 w-48"
              >
                <Button asChild size="lg" className="w-full rounded-full">
                  <Link href="#quote" onClick={() => setMobileOpen(false)}>Get a Quote</Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="w-full rounded-full">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>Mover Login</Link>
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
