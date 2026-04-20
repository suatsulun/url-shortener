import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type LinkState = {
  shortId: string;
  shortUrl: string;
  originalUrl: string;
};

const LinkCreated = () => {
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LinkState | null;

  if (!state) {
    return <Navigate to="/shorten" replace />;
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(state.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL", err);
    }
  };

  return (
    <div className="mx-auto mt-16 w-full max-w-xl px-4">
      <Card variant="elevated" padding="lg" className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-crimson">
            Link created
          </h1>
          <p className="text-sm text-muted">
            Share it anywhere — it'll redirect to your original URL.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Short URL
          </span>
          <a
            href={state.shortUrl}
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg bg-crimson-tint px-4 py-3 font-mono text-lg font-semibold text-crimson hover:underline"
          >
            {state.shortUrl}
          </a>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Original
          </span>
          <a
            href={state.originalUrl}
            target="_blank"
            rel="noreferrer"
            title={state.originalUrl}
            className="block truncate text-sm text-ink hover:text-crimson hover:underline"
          >
            {state.originalUrl}
          </a>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant={copied ? "success" : "primary"}
            onClick={copy}
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/shorten")}
          >
            Shorten another
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/dashboard")}
          >
            Go to dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LinkCreated;
