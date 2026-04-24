import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { type InputHTMLAttributes } from "react";

const inputVariants = cva(
  "block w-full rounded-lg border border-ink/10 bg-transparent px-3 py-2 text-sm transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-offset-2 " +
    "disabled:cursor-not-allowed disabled:opacity-50 " +
    "data-[invalid]:border-crimson data-[invalid]:text-crimson data-[invalid]:focus-visible:ring-crimson",
  {
    variants: {
      variant: {
        default: "",
        error:
          "border-crimson text-crimson placeholder:text-crimson/70 focus-visible:ring-crimson",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type InputProps = InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputVariants>;

export const Input = ({ className, variant, ...rest }: InputProps) => (
  <input className={cn(inputVariants({ variant }), className)} {...rest} />
);
