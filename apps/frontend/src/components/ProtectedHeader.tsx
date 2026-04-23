import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator } from "@/components/ui/Menu";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";

const ProtectedHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const displayName = user?.username
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
    : "";


  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-ink/10 bg-white px-4 sm:px-6">
      <Link to="/dashboard" className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Logo variant="red" className="h-8 sm:h-9 shrink-0" />
        <span className="hidden sm:inline text-lg font-bold tracking-tight text-crimson truncate">
          Suat's URL Shortener
        </span>
      </Link>

      <Menu>
        <MenuTrigger className="flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-1.5 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-bright border-1 border-crimson">
          <div className="hidden sm:flex flex-col items-start leading-tight min-w-0">
            <span className="text-sm font-semibold text-ink truncate max-w-[160px]">
              {displayName}
            </span>
            <span className="text-xs text-muted truncate max-w-[160px]">
              {user?.email}
            </span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-crimson text-sm font-bold text-white shrink-0">
            {user?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
        </MenuTrigger>

        <MenuContent>
          <MenuItem onClick={() => navigate("/dashboard")}>Dashboard</MenuItem>
          <MenuItem onClick={() => navigate("/shorten")}>Shorten</MenuItem>
          <MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
          <MenuSeparator />
          <MenuItem
            onClick={handleLogout}
            className="text-danger data-[highlighted]:bg-danger/10 data-[highlighted]:text-danger"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </MenuItem>
        </MenuContent>
      </Menu>
    </header>
  );
};

export default ProtectedHeader;
