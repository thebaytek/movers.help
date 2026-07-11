import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layouts/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Movers.help — AI-Powered Long Distance Moving",
    template: "%s | Movers.help",
  },
  description:
    "AI scans your home. You get the real price. No hidden fees, no bait-and-switch — just honest long-distance moving powered by artificial intelligence.",
  keywords: [
    "moving company",
    "long distance moving",
    "AI moving estimate",
    "moving quote",
    "furniture scanner",
    "moving cost calculator",
    "cross country movers",
  ],
  authors: [{ name: "Movers.help" }],
  creator: "Movers.help",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://movers.help",
    siteName: "Movers.help",
    title: "Movers.help — AI-Powered Long Distance Moving",
    description:
      "AI scans your home. You get the real price. No hidden fees.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Movers.help",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Movers.help — AI-Powered Long Distance Moving",
    description:
      "AI scans your home. You get the real price. No hidden fees.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var dark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (dark) document.documentElement.classList.add('dark');
                } catch(e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body
        className={`${jakarta.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {/* Persistent green grid overlay — covers entire site */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-grid scan-line-overlay" aria-hidden="true" />
        {/* Subtle green ambient glow behind content */}
        <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% -10%, rgba(118,255,3,0.04) 0%, transparent 70%),
              radial-gradient(ellipse 50% 40% at 80% 90%, rgba(118,255,3,0.02) 0%, transparent 60%),
              radial-gradient(ellipse 40% 30% at 20% 80%, rgba(118,255,3,0.015) 0%, transparent 50%)
            `
          }}
        />
        <ThemeProvider>
          <div className="relative z-10">
            {children}
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className:
                "!bg-[#0c0c16] !border !border-[#76ff03]/20 !text-[#f0f0f5] !rounded-xl",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
