import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76ff03] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-[color,background-color,border-color,transform] duration-200 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#76ff03] text-[#08080e] hover:bg-[#5ecc02]",
        destructive:
          "bg-red-600 text-white hover:bg-red-500",
        outline:
          "border border-[#76ff03]/30 bg-transparent hover:bg-[#76ff03]/10 text-[#76ff03]",
        secondary:
          "bg-[#76ff03]/8 text-[#76ff03] hover:bg-[#76ff03]/15",
        ghost:
          "hover:bg-white/[0.06] text-[#7a7a8c] hover:text-surface-100",
        accent:
          "bg-[#76ff03] text-[#08080e] hover:bg-[#5ecc02]",
        link: "text-[#76ff03] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-7 py-2",
        sm: "h-9 px-5 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
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
