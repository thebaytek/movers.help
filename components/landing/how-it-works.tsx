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

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative py-24 sm:py-32 overflow-hidden bg-white dark:bg-surface-950"
    >
      <div className="absolute inset-0 bg-dots opacity-30 dark:opacity-20" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight font-display sm:text-5xl">
            <span className="gradient-text">How It Works</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-surface-500 dark:text-surface-400 text-balance">
            Three simple steps to an honest moving quote
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mx-auto mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={cardVariants}
              whileHover={{
                y: -6,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              className="group/card relative"
            >
              <Card className="relative h-full overflow-hidden border-surface-200 dark:border-surface-800 group-hover/card:border-transparent group-hover/card:shadow-xl group-hover/card:shadow-brand-500/10 dark:group-hover/card:shadow-brand-400/5 transition-all duration-500">
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-brand-500/5 to-accent-500/5" />

                <span className="absolute right-6 top-4 text-8xl font-bold text-surface-100 dark:text-surface-800/30 pointer-events-none select-none leading-none font-display">
                  {step.number}
                </span>

                <div className="relative p-8 pt-16">
                  <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 p-0.5">
                    <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white dark:bg-surface-900">
                      <step.icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100 font-display">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-surface-500 dark:text-surface-400">
                    {step.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
