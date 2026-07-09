import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border-2 border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-4 py-2 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500",
          "transition-all duration-200",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "focus-visible:outline-none focus-visible:border-brand-500 dark:focus-visible:border-brand-400 focus-visible:ring-4 focus-visible:ring-brand-500/10 dark:focus-visible:ring-brand-400/10",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
