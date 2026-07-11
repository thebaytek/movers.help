"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const headline = "AI Scans Your Home. You Get the Real Price.";

const subheadline =
  "No hidden fees. No bait-and-switch. Just honest long-distance moving powered by AI that sees your stuff before the truck arrives.";

const trustItems = [
  { label: "Verified by 1,200+ happy movers" },
  { label: "4.9 avg rating", stars: 5 },
  { label: "Free, no-obligation quotes" },
];

function MagneticButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button> & {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 16 });
  const springY = useSpring(y, { stiffness: 180, damping: 16 });

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * 0.35);
    y.set(dy * 0.35);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("inline-block", className)}
    >
      <Button {...props}>{children}</Button>
    </motion.div>
  );
}

function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.2, duration: 0.6 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <div className="flex flex-col items-center gap-1">
        <svg
          width="24"
          height="36"
          viewBox="0 0 24 36"
          fill="none"
          className="text-surface-500"
        >
          <rect
            x="0.75"
            y="0.75"
            width="22.5"
            height="34.5"
            rx="11.25"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <motion.rect
            x="10.5"
            y="7"
            width="3"
            height="8"
            rx="1.5"
            fill="currentColor"
            animate={{ y: [7, 14, 7], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </motion.div>
  );
}

function FloatingOrb({
  className,
  colorClass,
  size = 600,
  delay = 0,
  duration = 8,
  xOffset,
  yOffset,
}: {
  className?: string;
  colorClass: string;
  size?: number;
  delay?: number;
  duration?: number;
  xOffset?: string;
  yOffset?: string;
}) {
  return (
    <motion.div
      className={cn(
        "absolute rounded-full blur-[120px]",
        colorClass,
        className
      )}
      style={{
        width: size,
        height: size,
        ...(xOffset && yOffset
          ? { left: xOffset, top: yOffset }
          : {}),
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0.35, 0.55, 0.35],
        scale: [0.9, 1.1, 0.9],
      }}
      transition={{
        opacity: { duration, delay, repeat: Infinity, ease: "easeInOut" },
        scale: {
          duration: duration * 1.2,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    />
  );
}

const wordVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      delay: 0.7 + i * 0.06,
      ease: [0.32, 0.72, 0, 1],
    },
  }),
};

export function Hero() {
  function scrollToHow() {
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#08080e]">
      <div className="absolute inset-0" />

      <FloatingOrb
        className="top-[-10%] right-[-15%]"
        colorClass="bg-accent-500/15"
        size={700}
        duration={9}
      />
      <FloatingOrb
        className="bottom-[-15%] left-[-12%]"
        colorClass="bg-accent-500/12"
        size={550}
        delay={1.5}
        duration={10}
        xOffset="10%"
        yOffset="60%"
      />
      <FloatingOrb
        className="top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2"
        colorClass="bg-accent-500/6"
        size={400}
        delay={3}
        duration={11}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-8 py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, filter: "blur(12px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
          className="flex justify-center mb-10"
        >
          <Logo />
        </motion.div>

        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-accent-500 bg-accent-500/[0.06] border border-accent-500/[0.12]">
            AI-Powered Long Distance Moving
          </span>
        </motion.div>

        <h1 className="mx-auto max-w-5xl text-center font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl gradient-text text-balance leading-[1.1]">
          {headline.split(" ").map((word, i) => (
            <motion.span
              key={i}
              className="inline-block"
              variants={wordVariants}
              initial="hidden"
              animate="visible"
              custom={i}
            >
              {word}
              {i < headline.split(" ").length - 1 ? " " : ""}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.7,
            delay: 1.5,
            ease: [0.32, 0.72, 0, 1],
          }}
          className="mx-auto mt-8 max-w-3xl text-center text-base sm:text-lg md:text-xl text-surface-400 text-balance leading-relaxed"
        >
          {subheadline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.7,
            delay: 1.75,
            ease: [0.32, 0.72, 0, 1],
          }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <MagneticButton variant="accent" size="xl">
            Get Your Quote
            <ArrowRight className="ml-2 h-5 w-5" />
          </MagneticButton>
          <Button variant="ghost" size="xl" onClick={scrollToHow}>
            <Play className="mr-2 h-5 w-5" />
            See How It Works
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.7,
            delay: 2.0,
            ease: [0.32, 0.72, 0, 1],
          }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-surface-400"
        >
          {trustItems.map((item, i) => (
            <div key={item.label} className="flex items-center gap-1.5">
              {item.stars &&
                Array.from({ length: item.stars }).map((_, si) => (
                  <Star
                    key={si}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              <span>{item.label}</span>
              {i < trustItems.length - 1 && (
                <span className="hidden sm:inline text-surface-700 mx-2">
                  |
                </span>
              )}
            </div>
          ))}
        </motion.div>
      </div>

      <ScrollIndicator />
    </section>
  );
}
