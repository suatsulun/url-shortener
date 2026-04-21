import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="mx-auto mt-16 w-full max-w-xl px-4">
      <Card
        variant="elevated"
        padding="lg"
        className="flex flex-col items-center gap-6 text-center"
      >
        <div className="flex flex-col gap-2">
          <span className="font-mono text-5xl font-bold text-crimson">
            404
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Page not found
          </h1>
          <p className="text-sm text-muted">
            The link you followed may be broken, expired, or never existed.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}
          >
            {isAuthenticated ? "Go to dashboard" : "Go home"}
          </Button>
          {isAuthenticated && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/shorten")}
            >
              Shorten a URL
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
