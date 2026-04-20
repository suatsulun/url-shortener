import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors " +
    "disabled:opacity-50 disabled:pointer-events-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-bright focus-visible:ring-offset-2",
    {
        variants: {
            variant: {
                primary: "bg-crimson text-white hover:bg-crimson-dark",
                secondary: "bg-white text-crimson border border-ink/10 hover:border-white hover:bg-crimson-bright hover:text-white" ,
                ghost: "bg-transparent text-ink hover:bg-surface hover:text-crimson hover:border-1 border-crimson",
                destructive: "bg-danger text-white hover:bg-danger-dark",
                success: "bg-emerald text-white hover:bg-emerald-dark",
                link: "bg-transparent text-crimson underline-offset-4 hover:text-crimson-bright hover:underline p-0 h-auto",
            },
            size: {
                sm: "h-8 px-3 text-sm",
                md: "h-10 px-4 text-sm",
                lg: "h-12 px-6 text-base",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
  };

export const Button = ({ className, variant, size, loading, disabled, children, ...rest }: ButtonProps) => (
  <button
    className={cn(buttonVariants({ variant, size }), className)}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    {...rest}
  >
    {children}
  </button>
);