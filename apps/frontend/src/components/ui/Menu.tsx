import { Menu as BaseMenu } from "@base-ui/react/menu";
import { cn } from "@/lib/cn";

type WithClass<T> = Omit<T, "className"> & { className?: string };

export const Menu = BaseMenu.Root;
export const MenuTrigger = BaseMenu.Trigger;

type MenuContentProps = WithClass<React.ComponentProps<typeof BaseMenu.Popup>> & {
  sideOffset?: number;
  align?: "start" | "center" | "end";
};

export const MenuContent = ({
  className,
  sideOffset = 8,
  align = "end",
  children,
  ...rest
}: MenuContentProps) => (
  <BaseMenu.Portal>
    <BaseMenu.Positioner sideOffset={sideOffset} align={align}>
      <BaseMenu.Popup
        className={cn(
          "min-w-[10rem] rounded-xl border border-ink/10 bg-white p-1 shadow-lg flex flex-col justify-center items-center",
          "origin-[var(--transform-origin)] transition-[transform,opacity] duration-150",
          "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
          "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
          className,
        )}
        {...rest}
      >
        {children}
      </BaseMenu.Popup>
    </BaseMenu.Positioner>
  </BaseMenu.Portal>
);

type MenuItemProps = WithClass<React.ComponentProps<typeof BaseMenu.Item>>;

export const MenuItem = ({ className, ...rest }: MenuItemProps) => (
  <BaseMenu.Item
    className={cn(
      "flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm text-ink outline-none",
      "data-[highlighted]:bg-crimson-tint data-[highlighted]:text-crimson-dark",
      className,
    )}
    {...rest}
  />
);

type MenuSeparatorProps = WithClass<React.ComponentProps<typeof BaseMenu.Separator>>;

export const MenuSeparator = ({ className, ...rest }: MenuSeparatorProps) => (
  <BaseMenu.Separator
    className={cn("my-1 h-px w-full bg-ink/13", className)}
    {...rest}
  />
);
