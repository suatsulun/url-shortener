import { Link } from "react-router-dom";
import { Logo } from "./ui/Logo";


const GuestHeader = () => {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-ink/10 bg-white px-4 sm:px-6">
      <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Logo variant="red" className="h-8 sm:h-9 shrink-0" />
        <span className="hidden sm:inline text-lg font-bold tracking-tight text-crimson truncate">
          Suat's URL Shortener
        </span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <Link
          to="/login"
          className="rounded-md bg-crimson px-3 sm:px-4 py-2 text-sm font-medium text-white hover:bg-crimson/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-bright"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="rounded-md bg-white px-3 sm:px-4 py-2 text-sm font-medium text-crimson border border-crimson hover:bg-crimson/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-bright"
        >
          Register
        </Link>
      </div>
    </header>
  );
};

export default GuestHeader;