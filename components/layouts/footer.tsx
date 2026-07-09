import { Logo, LogoIcon } from "@/components/brand/logo";
import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Reviews", href: "#reviews" },
    { label: "3D Truck Viewer", href: "#truck-viewer" },
  ],
  Company: [
    { label: "About", href: "#about" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  "For Movers": [
    { label: "Mover Login", href: "/login" },
    { label: "Partner Program", href: "#" },
    { label: "Resources", href: "#" },
    { label: "API", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
              AI-powered long-distance moving. Scan your home, get an honest price.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-surface-400 dark:text-surface-500">
            &copy; {new Date().getFullYear()} Movers.help. Built with care.
          </p>
          <p className="text-sm text-surface-400 dark:text-surface-500">
            All prices are estimates. Final pricing confirmed after inventory verification.
          </p>
        </div>
      </div>
    </footer>
  );
}
