import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#08080e",
};

export const metadata: Metadata = {
  title: "Room Scanner — Movers.help",
  description:
    "Scan your furniture with AI. Point your camera at each room and we'll estimate your move size instantly.",
};

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
