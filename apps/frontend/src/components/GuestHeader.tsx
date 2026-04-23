import { Link } from "react-router-dom";
import { Logo } from "./ui/Logo";


const GuestHeader = () => {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-end border-b border-ink/10 bg-white px-6">
      <Link to="/" className="flex items-center gap-3 mx-auto">
        <Logo variant="red" className="h-9" />
        <span className="text-lg font-bold tracking-tight text-crimson">
          Suat's URL Shortener
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <Link
          to="/login"
          className="rounded-md bg-crimson px-4 py-2 text-sm font-medium text-white hover:bg-crimson/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-bright"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-crimson border border-crimson hover:bg-crimson/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-bright"
        >
          Register
        </Link>
      </div>
    </header>
  );
};

export default GuestHeader;