import { Toast as BaseToast } from "@base-ui/react/toast";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";
import React from "react";

type WithClass<T> = Omit<T, "className"> & { className?: string };

const toastVariants = cva(
  // CSS variables (Base UI pattern, adapted for top-anchored stacking)
  "[--gap:0.5rem] [--peek:0.75rem] " +
    "[--scale:calc(max(0,1-(var(--toast-index)*0.05)))] " +
    "[--height:var(--toast-frontmost-height,var(--toast-height))] " +
    "[--offset-y:calc(var(--toast-offset-y)+calc(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))] " +
    // positioning (top-anchored instead of bottom)
    "pointer-events-auto absolute top-0 left-0 right-0 mx-0 w-full " +
    "z-[calc(1000-var(--toast-index))] " +
    "origin-top select-none " +
    // appearance
    "flex items-start gap-3 rounded-xl border bg-white p-4 pr-10 shadow-lg " +
    "bg-clip-padding " +
    // height & transition
    "h-[var(--height)] data-[expanded]:h-[var(--toast-height)] " +
    "[transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s] " +
    // resting transform (push older toasts DOWN behind the newest)
    "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))))_scale(var(--scale))] " +
    // expanded transform (fan downward)
    "data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))_scale(1)] " +
    // enter from above
    "data-[starting-style]:[transform:translateY(-150%)] " +
    // exit opacity
    "data-[ending-style]:opacity-0 data-[limited]:opacity-0 " +
    // default exit (no swipe): slide back up out the top
    "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-150%)] " +
    // swipe-up exit
    "data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] " +
    "data-[expanded]:data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
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
    <BaseToast.Viewport className="pointer-events-none fixed z-50 top-4 left-1/2 -translate-x-1/2 flex w-96 max-w-[calc(100vw-2rem)]">
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
            swipeDirection="up"
            className={cn(toastVariants({ variant }))}
          >
            <div className={iconChipVariants({ variant })}>
              <Icon className="h-5 w-5" />
            </div>
            <BaseToast.Content className="min-w-0 flex-1 overflow-hidden transition-opacity [transition-duration:250ms] data-[behind]:pointer-events-none data-[behind]:opacity-0 data-[expanded]:pointer-events-auto data-[expanded]:opacity-100">
              <div className="flex flex-col gap-1">
                <BaseToast.Title className="text-sm font-semibold leading-tight tracking-tight text-ink" />
                <BaseToast.Description className="text-sm leading-snug text-muted" />
                <BaseToast.Action className="self-start text-sm font-semibold text-crimson hover:text-crimson-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-bright rounded-md" />
              </div>
            </BaseToast.Content>
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
    undoable: (
      title: string,
      onUndo: () => void,
      options?: { description?: string; timeout?: number },
    ) => {
      const id = manager.add({
        title,
        description: options?.description,
        type: "default",
        timeout: options?.timeout ?? 5000,
        actionProps: {
          children: "Undo",
          onClick: () => {
            onUndo();
            manager.close(id);
          },
        },
      });
      return id;
    },
  };
};

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
      <BaseToast.Content className="min-w-0 flex-1 overflow-hidden transition-opacity [transition-duration:250ms] data-[behind]:pointer-events-none data-[behind]:opacity-0 data-[expanded]:pointer-events-auto data-[expanded]:opacity-100">
        <div className="flex flex-col gap-1">{children}</div>
      </BaseToast.Content>
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

export const ToastAction = ({
  className,
  ...rest
}: WithClass<React.ComponentProps<typeof BaseToast.Action>>) => (
  <BaseToast.Action
    className={cn(
      "inline-flex h-8 items-center justify-center rounded-md bg-crimson text-white px-3 text-sm font-medium transition-colors hover:bg-crimson-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-bright",
      className,
    )}
    {...rest}
  />
);
