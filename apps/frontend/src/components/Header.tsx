import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator } from "@/components/ui/Menu";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-ink/10 bg-white px-6">
      <Link to="/dashboard" className="flex items-center gap-3">
        <Logo variant="red" className="h-9" />
        <span className="text-lg font-bold tracking-tight text-crimson">
          Suat's URL Shortener
        </span>
      </Link>

      <Menu>
        <MenuTrigger className="flex items-center gap-3 rounded-lg px-3 py-1.5 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-bright border-1 border-crimson">
          <div className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold text-ink">{user?.username.charAt(0)?.toUpperCase() + user?.username?.slice(1)}</span>
            <span className="text-xs text-muted">{user?.email}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-crimson text-sm font-bold text-white">
            {user?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
        </MenuTrigger>

        <MenuContent>
          <MenuItem onClick={() => navigate("/dashboard")}>Dashboard</MenuItem>
          <MenuItem onClick={() => navigate("/shorten")}>Shorten</MenuItem>
          <MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
          <MenuSeparator />
          <MenuItem onClick={handleLogout} className="text-danger data-[highlighted]:bg-danger/10 data-[highlighted]:text-danger">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </MenuItem>
        </MenuContent>
      </Menu>
    </header>
  );
};

export default Header;
