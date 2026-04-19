import { cn } from "@/lib/cn";

type WithClass<T> = Omit<T, "className"> & { className?: string };

type TableProps = WithClass<React.HTMLAttributes<HTMLTableElement>>;
type SectionProps = WithClass<React.HTMLAttributes<HTMLTableSectionElement>>;
type RowProps = WithClass<React.HTMLAttributes<HTMLTableRowElement>>;
type CellProps = WithClass<React.TdHTMLAttributes<HTMLTableCellElement>>;
type HeadProps = WithClass<React.ThHTMLAttributes<HTMLTableCellElement>>;

export const Table = ({ className, ...rest }: TableProps) => (
  <div className="w-full overflow-x-auto rounded-xl border border-ink/10 bg-white">
    <table
      className={cn("w-full border-collapse text-sm", className)}
      {...rest}
    />
  </div>
);

export const TableHeader = ({ className, ...rest }: SectionProps) => (
  <thead className={cn("bg-surface", className)} {...rest} />
);

export const TableBody = ({ className, ...rest }: SectionProps) => (
  <tbody className={cn("", className)} {...rest} />
);

export const TableRow = ({ className, ...rest }: RowProps) => (
  <tr
    className={cn(
      "border-b border-ink/10 last:border-0 transition-colors",
      "hover:bg-crimson-tint/40",
      className,
    )}
    {...rest}
  />
);

export const TableHead = ({ className, ...rest }: HeadProps) => (
  <th
    className={cn(
      "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted",
      "border-r border-ink/10 last:border-r-0",
      className,
    )}
    {...rest}
  />
);

export const TableCell = ({ className, ...rest }: CellProps) => (
  <td
    className={cn(
      "px-6 py-3 align-middle text-ink",
      "border-r border-ink/10 last:border-r-0",
      className,
    )}
    {...rest}
  />
);
