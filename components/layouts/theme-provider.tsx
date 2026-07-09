"use client";

import { useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolved } = useTheme();

  // Prevent flash of wrong theme
  useEffect(() => {
    const script = document.createElement("script");
    script.innerHTML = `
      (function() {
        try {
          var theme = localStorage.getItem('theme');
          var dark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
          if (dark) document.documentElement.classList.add('dark');
        } catch(e) {}
      })();
    `;
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  return <>{children}</>;
}
