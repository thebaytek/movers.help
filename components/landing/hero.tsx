"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const headline = "AI inventory scanning built for movers.";

const subheadline =
  "Turn a customer’s phone camera into a calibrated, reviewable furniture inventory your sales team can trust.";

/** Inline product visual — scanner HUD plane for the first viewport */
function HeroScannerPlane() {
  return (
    <div
      className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-surface-900"
      aria-hidden="true"
    >
      <div className="aspect-[21/9] w-full sm:aspect-[2.4/1]">
        {/* Warm room plane */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(165deg, #2a2a3a 0%, #1a1a28 42%, #12121c 100%)",
          }}
        />
        <div className="absolute inset-x-0 top-[58%] bottom-0 bg-gradient-to-b from-[#2e2e3f] to-[#14141e]" />
        <div className="absolute inset-x-0 top-[56%] h-px bg-white/10" />

        {/* Soft window light — no blur orbs */}
        <div
          className="absolute left-[12%] top-[10%] h-[36%] w-[22%] rounded-sm border border-white/10"
          style={{
            background:
              "linear-gradient(180deg, rgba(160,180,210,0.28), rgba(160,180,210,0.08))",
          }}
        />

        {/* Furniture blocks */}
        <div className="absolute left-[18%] top-[42%] h-[28%] w-[34%] rounded-sm bg-[#6b7280]/55" />
        <div className="absolute left-[56%] top-[48%] h-[18%] w-[14%] rounded-sm bg-[#78716c]/45" />
        <div className="absolute left-[72%] top-[40%] h-[26%] w-[12%] rounded-sm bg-[#64748b]/40" />

        {/* Live HUD boxes */}
        <div className="absolute left-[17%] top-[40%] h-[32%] w-[36%] border border-[#76ff03]/70">
          <span className="absolute -top-5 left-0 bg-[#76ff03] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#08080e]">
            Sofa (3-seater) · 58 ft³ · 97%
          </span>
          <div className="absolute -left-px -top-px h-2.5 w-2.5 border-l-2 border-t-2 border-[#76ff03]" />
          <div className="absolute -right-px -top-px h-2.5 w-2.5 border-r-2 border-t-2 border-[#76ff03]" />
          <div className="absolute -bottom-px -left-px h-2.5 w-2.5 border-b-2 border-l-2 border-[#76ff03]" />
          <div className="absolute -bottom-px -right-px h-2.5 w-2.5 border-b-2 border-r-2 border-[#76ff03]" />
        </div>
        <div className="absolute left-[55%] top-[46%] h-[22%] w-[16%] border border-[#76ff03]/55">
          <span className="absolute -top-5 left-0 whitespace-nowrap bg-[#76ff03]/90 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#08080e]">
            Dining Chair · 7 ft³
          </span>
        </div>

        {/* Scan line */}
        <div className="absolute inset-x-0 top-[38%] h-px bg-gradient-to-r from-transparent via-[#76ff03] to-transparent opacity-80" />

        {/* Bottom strip */}
        <div className="absolute inset-x-4 bottom-3 flex items-center justify-between rounded-lg border border-white/10 bg-surface-950/80 px-3 py-2 sm:inset-x-6">
          <span className="text-[11px] text-surface-400">Living Room · calibrated</span>
          <span className="font-mono text-xs font-semibold tabular-nums text-[#76ff03]">
            4 items · 92 cu ft
          </span>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  function scrollToDemo() {
    document
      .getElementById("see-it-in-action")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20">
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="text-center font-display text-4xl font-bold tracking-tight text-surface-50 sm:text-5xl md:text-6xl lg:text-7xl"
        >
          movers<span className="text-[#76ff03]">.</span>help
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: [0.32, 0.72, 0, 1] }}
          className="mx-auto mt-6 max-w-3xl text-balance text-center font-display text-xl font-semibold leading-snug tracking-tight text-surface-200 sm:text-2xl md:text-3xl"
        >
          {headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22, ease: [0.32, 0.72, 0, 1] }}
          className="mx-auto mt-5 max-w-2xl text-balance text-center text-base leading-relaxed text-surface-400 sm:text-lg"
        >
          {subheadline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.32, ease: [0.32, 0.72, 0, 1] }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button asChild size="lg" className="min-h-12 rounded-xl px-7">
            <Link href="/scan">
              Try the scanner
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="min-h-12 rounded-xl"
            onClick={scrollToDemo}
          >
            <Play className="mr-2 h-4 w-4" />
            See it in action
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.32, 0.72, 0, 1] }}
          className="mt-12 sm:mt-14"
        >
          <HeroScannerPlane />
        </motion.div>
      </div>
    </section>
  );
}
