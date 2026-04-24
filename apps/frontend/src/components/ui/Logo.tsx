import redlogo from "@/assets/redlogo.png";
import whitelogo from "@/assets/whitelogo.png";
import { cn } from "@/lib/cn";

const sources = {
  red: redlogo,
  white: whitelogo,
} as const;

type LogoProps = {
  variant?: keyof typeof sources;
  pulse?: boolean;
  className?: string;
};

export const Logo: React.FC<LogoProps> = ({
  variant = "red",
  pulse = false,
  className,
}) => {
  const logoSrc = sources[variant];
  return (
    <img
      src={logoSrc}
      alt="Logo"
      className={cn(
        "h-20 w-auto transition-transform duration-300",
        pulse && "animate-pulse",
        className,
      )}
    />
  );
};
