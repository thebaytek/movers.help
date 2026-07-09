import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-200",
        secondary:
          "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400",
        success:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
        warning:
          "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
        destructive:
          "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
