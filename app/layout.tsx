import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layouts/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
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
        {/* Inline theme script to prevent FART (Flash of Awkward Right Theme) */}
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
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className:
                "!bg-white dark:!bg-surface-900 !border !border-surface-200 dark:!border-surface-800 !text-surface-900 dark:!text-surface-100 !rounded-xl",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
