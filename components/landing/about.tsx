"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Brain, ShieldCheck, Map, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

const pillars = [
  {
    icon: Brain,
    title: "AI That Actually Works",
    description:
      "Our object detection model is trained on 10,000+ room scans. It identifies furniture with 94% accuracy, calculating cubic footage in real time. No manual inventory forms.",
  },
  {
    icon: ShieldCheck,
    title: "Radical Price Transparency",
    description:
      "We show you exactly what you're paying for: volume, distance, labor, seasonality. Every line item explained. The price you see is the price you pay — guaranteed within 5%.",
  },
  {
    icon: Map,
    title: "Built for Long Distance",
    description:
      "Cross-country moves are complex. We factor in fuel costs, driver hours, weight distribution, and multi-day logistics. Optimized for moves over 500 miles.",
  },
];

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function About() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      ref={ref}
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 bg-dots opacity-40 dark:opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight font-display sm:text-5xl">
            <span className="gradient-text">Why We Built This</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-surface-600 dark:text-surface-400 text-balance">
            Traditional moving quotes are a black box. You fill out a form, get a
            vague estimate, and cross your fingers that the final bill won&apos;t be
            double. We built Movers.help to make moving actually transparent —
            from the first scan to the final mile.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {pillars.map((pillar) => (
            <motion.div key={pillar.title} variants={fadeInUp}>
              <Card className="group h-full p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 p-0.5">
                  <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white dark:bg-surface-900">
                    <pillar.icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100 font-display">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-surface-500 dark:text-surface-400">
                  {pillar.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mx-auto mt-16 max-w-3xl"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-brand-200/60 dark:border-brand-800/40 bg-brand-50/60 dark:bg-brand-950/30 px-6 py-4 backdrop-blur-sm">
            <Sparkles className="h-5 w-5 shrink-0 text-brand-500 dark:text-brand-400" />
            <p className="text-sm font-medium text-brand-800 dark:text-brand-200">
              Early access. Real product. No fake stats, no paid reviews. Just
              software that makes moving suck less.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
