"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative px-4 py-28">
      <div className="relative mx-auto max-w-2xl text-center">
        <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <h2 className="font-display text-3xl font-bold tracking-tight text-surface-50 sm:text-4xl md:text-5xl">
          Built for moving teams
        </h2>
        <p className="mx-auto mt-4 max-w-md text-balance text-lg text-surface-400">
          Run a branded, reviewable inventory scan from any phone — then take the
          numbers into quoting and load planning.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/scan">
              Try the scanner
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="rounded-xl">
            <Link href="/login">Mover login</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
