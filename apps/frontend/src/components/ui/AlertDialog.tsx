import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { cn } from "@/lib/cn";
import React from "react";

type WithClass<T> = Omit<T, "className"> & { className?: string };

export const AlertDialog = BaseAlertDialog.Root;
export const AlertDialogTrigger = BaseAlertDialog.Trigger;
export const AlertDialogClose = BaseAlertDialog.Close;

export const AlertDialogContent = ({
  className,
  children,
  ...rest
}: WithClass<React.ComponentProps<typeof BaseAlertDialog.Popup>>) => (
  <BaseAlertDialog.Portal>
    <BaseAlertDialog.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm",
        "transition-opacity duration-200",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
      )}
    />
    <BaseAlertDialog.Popup
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
        "rounded-xl border border-crimson/30 bg-white p-6 shadow-xl outline-none",
        "flex flex-col gap-4",
        "transition-[transform,opacity] duration-200",
        "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
        "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
        className,
      )}
      {...rest}
    >
      {children}
    </BaseAlertDialog.Popup>
  </BaseAlertDialog.Portal>
);

export const AlertDialogTitle = ({
  className,
  ...rest
}: WithClass<React.ComponentProps<typeof BaseAlertDialog.Title>>) => (
  <BaseAlertDialog.Title
    className={cn(
      "text-xl font-bold tracking-tight text-ink",
      className,
    )}
    {...rest}
  />
);

export const AlertDialogDescription = ({
  className,
  ...rest
}: WithClass<React.ComponentProps<typeof BaseAlertDialog.Description>>) => (
  <BaseAlertDialog.Description
    className={cn("text-sm leading-relaxed text-muted", className)}
    {...rest}
  />
);

export const AlertDialogFooter = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mt-2 flex flex-wrap items-center justify-end gap-3",
      className,
    )}
    {...rest}
  />
);
