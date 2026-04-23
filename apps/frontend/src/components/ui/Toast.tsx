import { Toast as BaseToast } from "@base-ui/react/toast";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";
import React from "react";

type WithClass<T> = Omit<T, "className"> & { className?: string };

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-3 rounded-xl border bg-white p-4 pr-10 shadow-lg " +
    "transition-[transform,opacity] duration-300 " +
    "data-[starting-style]:translate-x-full data-[starting-style]:opacity-0 " +
    "data-[ending-style]:translate-x-full data-[ending-style]:opacity-0",
  {
    variants: {
      variant: {
        default: "border-ink/15",
        success: "border-emerald/40",
        error: "border-danger/40",
        info: "border-crimson/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const iconChipVariants = cva(
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
  {
    variants: {
      variant: {
        default: "bg-surface text-ink",
        success: "bg-emerald/10 text-emerald",
        error: "bg-danger/10 text-danger",
        info: "bg-crimson-tint text-crimson",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const iconMap = {
  default: Info,
  success: CheckCircle2,
  error: XCircle,
  info: AlertCircle,
} as const;

type ToastVariant = keyof typeof iconMap;

export const ToastProvider = BaseToast.Provider;

export const ToastViewport = () => (
  <BaseToast.Portal>
    <BaseToast.Viewport className="pointer-events-none fixed top-4 right-4 z-50 flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2 outline-none">
      <ToastList />
    </BaseToast.Viewport>
  </BaseToast.Portal>
);

const ToastList = () => {
  const { toasts } = BaseToast.useToastManager();
  return (
    <>
      {toasts.map((toast) => {
        const variant = (toast.type as ToastVariant) ?? "default";
        const Icon = iconMap[variant] ?? Info;
        return (
          <BaseToast.Root
            key={toast.id}
            toast={toast}
            className={cn(toastVariants({ variant }))}
          >
            <div className={iconChipVariants({ variant })}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <BaseToast.Title className="text-sm font-semibold leading-tight tracking-tight text-ink" />
              <BaseToast.Description className="text-sm leading-snug text-muted" />
            </div>
            <BaseToast.Close
              aria-label="Close"
              className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-bright"
            >
              <X className="h-4 w-4" />
            </BaseToast.Close>
          </BaseToast.Root>
        );
      })}
    </>
  );
};

export const useToast = () => {
  const manager = BaseToast.useToastManager();

  return {
    success: (title: string, description?: string) =>
      manager.add({ title, description, type: "success", timeout: 4000 }),
    error: (title: string, description?: string) =>
      manager.add({ title, description, type: "error", timeout: 5000 }),
    info: (title: string, description?: string) =>
      manager.add({ title, description, type: "info", timeout: 4000 }),
    message: (title: string, description?: string) =>
      manager.add({ title, description, type: "default", timeout: 4000 }),
  };
};

export const useToastManager = BaseToast.useToastManager;

type ToastProps = WithClass<React.ComponentProps<typeof BaseToast.Root>> &
  VariantProps<typeof toastVariants>;

export const Toast = ({
  className,
  variant = "default",
  children,
  ...rest
}: ToastProps) => {
  const Icon = iconMap[variant ?? "default"];
  return (
    <BaseToast.Root
      className={cn(toastVariants({ variant }), className)}
      {...rest}
    >
      <div className={iconChipVariants({ variant })}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">{children}</div>
      <BaseToast.Close
        aria-label="Close"
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-bright"
      >
        <X className="h-4 w-4" />
      </BaseToast.Close>
    </BaseToast.Root>
  );
};

export const ToastTitle = ({
  className,
  ...rest
}: WithClass<React.ComponentProps<typeof BaseToast.Title>>) => (
  <BaseToast.Title
    className={cn(
      "text-sm font-semibold leading-tight tracking-tight text-ink",
      className,
    )}
    {...rest}
  />
);

export const ToastDescription = ({
  className,
  ...rest
}: WithClass<React.ComponentProps<typeof BaseToast.Description>>) => (
  <BaseToast.Description
    className={cn("text-sm leading-snug text-muted", className)}
    {...rest}
  />
);
