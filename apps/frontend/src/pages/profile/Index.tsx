import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-muted">
        <p>You need to be logged in to view your profile.</p>
        <Button onClick={() => navigate("/login")}>Login</Button>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const details = [
    { label: "Username", value: user.username },
    { label: "Email", value: user.email },
    {
      label: "Member since",
      value: new Date(user.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="mx-auto mt-16 w-full max-w-xl px-4">
      <Card variant="elevated" padding="lg" className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-crimson justify-center flex">
            Profile
          </h1>
          <p className="text-sm text-muted justify-center flex">
            Your account details.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {details.map((row) => (
            <div key={row.label} className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                {row.label}
              </span>
              <span className="text-ink">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 justify-around">
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate("/profile/edit")}
          >
            Edit profile
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/profile/security")}
          >
            Security
          </Button>
          <Button type="button" variant="ghost" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
