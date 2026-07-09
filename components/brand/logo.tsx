"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 group", className)}>
      <motion.div
        className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 shadow-lg shadow-brand-500/20 flex items-center justify-center overflow-hidden"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white" />
        </div>
        {/* Box icon */}
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 text-white relative z-10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </motion.div>
      <span className="text-lg font-bold tracking-tight text-surface-900 dark:text-surface-100 font-[family-name:var(--font-display)]">
        movers<span className="text-brand-600 dark:text-brand-400">.</span>help
      </span>
    </Link>
  );
}

export function LogoIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-10 h-10 rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 shadow-lg shadow-brand-500/20 flex items-center justify-center overflow-hidden relative",
        className
      )}
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white" />
      </div>
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 text-white relative z-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    </div>
  );
}
