"use client";

import { useEffect } from "react";
import { Nav } from "@/components/layouts/nav";
import { Footer } from "@/components/layouts/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ScannerDemo } from "@/components/landing/scanner-demo";
import { TruckViewer } from "@/components/landing/truck-viewer";
import { About } from "@/components/landing/about";
import { TrustSignals } from "@/components/landing/trust-signals";
import { Reviews } from "@/components/landing/reviews";
import { QuoteSection } from "@/components/landing/quote-section";
import { FinalCTA } from "@/components/landing/final-cta";
import MatrixRain from "@/components/landing/matrix-rain";

export default function Home() {
  useEffect(() => {
    document.body.setAttribute("data-has-rain", "");
    return () => {
      document.body.removeAttribute("data-has-rain");
    };
  }, []);

  return (
    <>
      <Nav />
      <main>
        <MatrixRain />
        <Hero />
        <HowItWorks />
        <ScannerDemo />
        <TruckViewer />
        <About />
        <TrustSignals />
        <Reviews />
        <QuoteSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
