import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
  {
    variants: {
      variant: {
        default: "border border-transparent bg-primary text-primary-foreground shadow-[0_16px_34px_rgba(255,107,44,0.24)] hover:bg-primary/95 hover:shadow-[0_18px_38px_rgba(255,107,44,0.30)]",
        destructive:
          "border border-transparent bg-destructive text-destructive-foreground shadow-[0_14px_28px_rgba(220,63,63,0.18)] hover:bg-destructive/90",
        outline:
          "border border-orange-200 bg-white text-slate-700 shadow-[0_10px_24px_rgba(232,145,73,0.06)] hover:bg-orange-50 hover:text-slate-900",
        secondary:
          "border border-orange-100 bg-[#fff9f3] text-slate-700 hover:bg-[#fff2e5]",
        ghost: "text-slate-600 hover:bg-orange-50 hover:text-orange-700",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
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
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
