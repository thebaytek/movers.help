"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

function MagneticButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 300, damping: 18 });
  const springY = useSpring(y, { stiffness: 300, damping: 18 });

  const tx = useTransform(springX, [-1, 1], [-8, 8]);
  const ty = useTransform(springY, [-1, 1], [-8, 8]);

  function handleMouse(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) / (rect.width / 2));
    y.set((e.clientY - cy) / (rect.height / 2));
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      style={{ x: tx, y: ty }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}

export function FinalCTA() {
  return (
    <section className="relative py-28 px-4 overflow-hidden bg-grid">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent" />
      </div>

      <div className="max-w-2xl mx-auto relative">
        <div className="relative glass-elevated rounded-3xl p-10 sm:p-14 text-center overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-brand-400/20 via-accent-400/10 to-transparent blur-3xl pointer-events-none"
          />

          <h2 className="relative text-4xl sm:text-5xl font-display font-bold gradient-text mb-4">
            Ready to Move?
          </h2>
          <p className="relative text-surface-600 dark:text-surface-400 text-lg max-w-md mx-auto text-balance mb-8">
            Get your AI-powered moving quote in under 3 minutes. No spam, no obligation — just an honest price.
          </p>

          <MagneticButton className="relative">
            <Button
              variant="accent"
              size="xl"
              className="text-lg"
              onClick={() => {
                document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Get Your Free Quote
            </Button>
          </MagneticButton>

          <div className="relative mt-6 flex items-center justify-center gap-5 text-sm text-surface-500 dark:text-surface-400">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-surface-700 dark:text-surface-300">4.9</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-surface-300 dark:bg-surface-700" />
            <span>1,200+ happy movers</span>
            <span className="w-1 h-1 rounded-full bg-surface-300 dark:bg-surface-700" />
            <span>Free, instant estimates</span>
          </div>

          <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-400/30 to-transparent" />
        </div>
      </div>
    </section>
  );
}
