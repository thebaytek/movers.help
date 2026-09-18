"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Camera, ClipboardCheck, Truck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Camera,
    title: "Scan the home",
    description:
      "Walk rooms with a phone. Furniture and large goods are detected with calibrated cubic footage in real time.",
  },
  {
    number: "02",
    icon: ClipboardCheck,
    title: "Review the inventory",
    description:
      "Confirm labels, measurements, quantities, and rooms before anything is submitted to the moving team.",
  },
  {
    number: "03",
    icon: Truck,
    title: "Plan the move",
    description:
      "The company gets an itemized, brandable inventory for quoting, load planning, and follow-up.",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative py-24 sm:py-32"
    >
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-display text-3xl font-bold tracking-tight text-surface-50 sm:text-4xl md:text-5xl">
            How it works
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-surface-400 text-balance">
            Three steps from camera walkthrough to a reviewed moving inventory.
          </p>
        </motion.div>

        <ol className="mx-auto mt-16 grid max-w-5xl gap-10 sm:grid-cols-3 sm:gap-8">
          {steps.map((step, i) => (
            <motion.li
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.12 + i * 0.1,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="relative"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm font-semibold text-[#76ff03]">
                  {step.number}
                </span>
                <step.icon className="h-5 w-5 text-surface-400" aria-hidden />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-surface-100">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-surface-400">
                {step.description}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
