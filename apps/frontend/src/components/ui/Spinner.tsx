import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import React from "react";
import { Loader2 } from "lucide-react";

const spinnerVariants = cva("animate-spin", {
    variants: {
        size: {
            sm: "h-4 w-4",
            md: "h-6 w-6",
            lg: "h-8 w-8",
        },
    },
    defaultVariants: {
        size: "md",
    },
});

type SpinnerProps = React.SVGAttributes<SVGElement> &
    VariantProps<typeof spinnerVariants>;

export const Spinner = ({ className, size, ...rest }: SpinnerProps) => (
    <Loader2 className={cn(spinnerVariants({ size }), className)} {...rest} />
);