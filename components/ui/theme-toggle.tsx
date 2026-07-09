"use client";

import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";

export function ThemeToggle() {
  const { resolved, toggle } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="rounded-full"
      aria-label="Toggle theme"
    >
      {resolved === "dark" ? (
        <Sun className="h-5 w-5 text-amber-400" />
      ) : (
        <Moon className="h-5 w-5 text-surface-600" />
      )}
    </Button>
  );
}
