import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[#76ff03]/10 border border-[#76ff03]/20 text-[#76ff03]",
        secondary:
          "bg-[#0c0c16] border border-[#161626] text-[#7a7a8c]",
        success:
          "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400",
        warning:
          "bg-amber-500/10 border border-amber-500/20 text-amber-400",
        destructive:
          "bg-red-500/10 border border-red-500/20 text-red-400",
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
