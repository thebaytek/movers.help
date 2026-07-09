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

export default function Home() {
  return (
    <>
      <Nav />
      <main>
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
