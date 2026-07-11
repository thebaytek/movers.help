"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, ReceiptText, Lock, BadgeCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

const benefits = [
  {
    icon: Zap,
    title: "AI Room Scanning",
    description:
      "Our computer vision model has been tested on 50,000+ room scans across 1,200+ real moves. It detects furniture and calculates volume automatically.",
  },
  {
    icon: ReceiptText,
    title: "Itemized Pricing",
    description:
      "Every line item explained. No lump-sum \"estimates\" that double on moving day. You see volume, distance, labor, and seasonal factors broken down.",
  },
  {
    icon: Lock,
    title: "Price Lock Guarantee",
    description:
      "Your quote is locked for 30 days. If our estimate is off by more than 5%, we pay the difference. No asterisks, no fine print.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Mover Network",
    description:
      "Every mover in our network is background-checked, insured, and rated by real customers. We monitor performance data across every shipment.",
  },
];

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
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

export function TrustSignals() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-24 sm:py-32 overflow-hidden bg-[#0c0c16]"
    >
      <div className="absolute inset-0 bg-surface-900/50" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight font-display sm:text-5xl">
            <span className="gradient-text">Why People Trust Us</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-surface-400 text-balance">
            Every claim on this page is backed by our technology, our contracts,
            and our track record. No &quot;trusted by millions&quot; fluff.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {benefits.map((benefit) => (
            <motion.div key={benefit.title} variants={fadeInUp}>
              <Card className="group h-full p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-950/50">
                  <benefit.icon className="h-5 w-5 text-accent-500" />
                </div>
                <h3 className="text-base font-bold text-surface-100 font-display">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-surface-400">
                  {benefit.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
