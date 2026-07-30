"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Camera, Calculator, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    number: 1,
    icon: Camera,
    title: "Scan Your Home",
    description:
      "Walk through your rooms with your phone. Our AI automatically detects your furniture and calculates cubic footage in real-time.",
  },
  {
    number: 2,
    icon: Calculator,
    title: "Get Your Quote",
    description:
      "We factor in distance, volume, labor, and seasonality to give you an all-in price. No surprises, no adjustments.",
  },
  {
    number: 3,
    icon: Truck,
    title: "Book With Confidence",
    description:
      "Choose from verified movers in our network. Your price is locked in — we guarantee it within 5%.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 48, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      delay: 0.2 + i * 0.15,
      ease: [0.32, 0.72, 0, 1],
    },
  }),
};

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 bg-dots opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Eyebrow + heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-accent-500 bg-accent-500/[0.06] border border-accent-500/[0.12] mb-6">
            How It Works
          </span>
          <h2 className="text-4xl font-bold tracking-tight font-display sm:text-5xl text-[#76ff03]">
            How It Works
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-surface-400 text-balance">
            Three simple steps to an honest moving quote
          </p>
        </motion.div>

        {/* Cards — custom staggered variants */}
        <div className="mx-auto mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              whileHover={{
                y: -4,
                transition: { type: "spring", stiffness: 300, damping: 24 },
              }}
              className="group/card"
            >
              <Card className="relative h-full overflow-hidden border-surface-800 group-hover/card:border-transparent group-hover/card:shadow-xl group-hover/card:shadow-accent-500/10 transition-all duration-500">
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-accent-500/5 to-accent-500/5" />

                <span className="absolute right-6 top-4 text-8xl font-bold text-surface-800/30 pointer-events-none select-none leading-none font-display">
                  {step.number}
                </span>

                <div className="relative p-8 pt-16">
                  <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-600 to-accent-500 p-0.5">
                    <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-surface-950">
                      <step.icon className="h-6 w-6 text-accent-500" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-surface-100 font-display">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-surface-400">
                    {step.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
