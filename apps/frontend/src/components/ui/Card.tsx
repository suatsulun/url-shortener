import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const cardVariants = cva("rounded-lg border border-ink/10 bg-white", {
  variants: {
    variant: {
      default: "",
      elevated: "shadow-md",
      interactive:
        "shadow-sm transition-shadow cursor-pointer hover:shadow-md " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-offset-2",
    },
    padding: {
      none: "p-0",
      sm: "p-3",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
});


type CardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants>;

export const Card = ({
  className,
  variant,
  ...rest
}: CardProps) => (
    <div
      className={cn(cardVariants({ variant }), className)}
      {...rest}
    />
);