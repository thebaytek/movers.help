import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 shadow-lg shadow-brand-500/25 dark:shadow-brand-500/20",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/25",
        outline:
          "border-2 border-surface-300 dark:border-surface-700 bg-transparent hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300",
        secondary:
          "bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 hover:bg-surface-200 dark:hover:bg-surface-700",
        ghost:
          "hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400",
        accent:
          "bg-gradient-to-r from-brand-600 to-accent-500 text-white hover:from-brand-700 hover:to-accent-600 shadow-lg shadow-brand-500/25 dark:shadow-accent-500/20",
        link: "text-brand-600 dark:text-brand-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
