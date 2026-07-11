"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 group", className)}>
      <motion.div
        className="relative w-9 h-9 rounded-lg bg-[#0a0a14] border border-[#76ff03]/20 flex items-center justify-center overflow-hidden"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {/* Subtle radar ring behind mark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
            <circle cx="20" cy="20" r="15" stroke="#76ff03" strokeWidth="0.6" />
            <circle cx="20" cy="20" r="10" stroke="#76ff03" strokeWidth="0.5" />
            <circle cx="20" cy="20" r="5" stroke="#76ff03" strokeWidth="0.7" />
          </svg>
        </div>
        {/* m monogram */}
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 relative z-10"
          fill="none"
          stroke="#76ff03"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="6" y1="5" x2="6" y2="18" />
          <path d="M6,13 Q6,8 12,8 Q18,8 18,13" />
          <line x1="18" y1="13" x2="18" y2="18" />
        </svg>
        {/* Center dot — only cyan allowed */}
        <div className="absolute w-1 h-1 rounded-full bg-[#00e5ff] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20" />
      </motion.div>
      <span className="text-lg font-bold tracking-tight text-surface-900 dark:text-surface-100 font-[family-name:var(--font-display)]">
        movers<span className="text-[#76ff03]">.</span>help
      </span>
    </Link>
  );
}

export function LogoIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-10 h-10 rounded-lg bg-[#0a0a14] border border-[#76ff03]/20 flex items-center justify-center overflow-hidden relative",
        className
      )}
    >
      {/* Radar rings */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
          <circle cx="20" cy="20" r="15" stroke="#76ff03" strokeWidth="0.6" />
          <circle cx="20" cy="20" r="10" stroke="#76ff03" strokeWidth="0.5" />
          <circle cx="20" cy="20" r="5" stroke="#76ff03" strokeWidth="0.7" />
        </svg>
      </div>
      {/* m monogram */}
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 relative z-10"
        fill="none"
        stroke="#76ff03"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="6" y1="5" x2="6" y2="18" />
        <path d="M6,13 Q6,8 12,8 Q18,8 18,13" />
        <line x1="18" y1="13" x2="18" y2="18" />
      </svg>
      {/* Center dot — only cyan allowed */}
      <div className="absolute w-1 h-1 rounded-full bg-[#00e5ff] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20" />
    </div>
  );
}
