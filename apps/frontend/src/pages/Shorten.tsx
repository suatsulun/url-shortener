import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormError,
} from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { useShortenUrlMutation } from "@/store/api/urlsApi";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addRecent,
  clearRecents,
  restoreRecents,
} from "@/store/slices/recentsSlice";
import { Link } from "react-router-dom";
import { History, X } from "lucide-react";

const Shorten = () => {
  const [shorten, { isLoading }] = useShortenUrlMutation();
  const dispatch = useAppDispatch();
  const recents = useAppSelector((s) => s.recents.items);
  const navigate = useNavigate();
  const toast = useToast();

  const handleClearAll = () => {
    const snapshot = recents;
    dispatch(clearRecents());
    toast.undoable("Recents cleared", () => {
      dispatch(restoreRecents(snapshot));
    });
  };

  const shortenAction = async (formData: FormData) => {
    try {
      const url = formData.get("url") as string;
      const data = await shorten({ originalUrl: url }).unwrap();
      dispatch(
        addRecent({
          shortId: data.shortId,
          originalUrl: data.originalUrl,
          createdAt: new Date().toISOString(),
        }),
      );
      toast.success("Link shortened", "Your short URL is ready to share.");
      navigate(`/link-created`, { state: data });
    } catch (err: any) {
      toast.error(
        "Failed to shorten URL",
        err?.data?.error ?? "Please try again.",
      );
    }
  };

  return (
    <div className="mx-auto mt-16 flex w-full max-w-xl flex-col gap-6 px-4">
      <Card
        variant="elevated"
        padding="lg"
        className="flex flex-col gap-6  border-crimson border-2"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-crimson items-center justify-center flex">
            Shorten a URL
          </h1>
          <p className="text-sm text-muted">
            Paste a long link and we'll give you a short one to share.
          </p>
        </div>

        <Form action={shortenAction} className="flex flex-col gap-4">
          <FormField>
            <FormLabel>URL</FormLabel>
            <FormControl
              type="text"
              name="url"
              placeholder="example.com or https://example.com"
              pattern="^(https?:\/\/)?[^\s]+\.[^\s]+$"
              required
            />
            <FormError match="valueMissing">URL is required</FormError>
            <FormError match="patternMismatch">
              Enter a valid URL like "example.com"
            </FormError>
          </FormField>

          <div className="flex items-center justify-center">
            <Button loading={isLoading} type="submit">
              Shorten
            </Button>
          </div>
        </Form>
      </Card>

      {recents.length > 0 && (
        <Card
          variant="elevated"
          padding="lg"
          className="flex flex-col gap-4 border-crimson/30"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-crimson-tint text-crimson">
                <History className="h-5 w-5" />
              </div>
              <div className="flex flex-col leading-tight">
                <h2 className="text-lg font-bold tracking-tight text-ink">
                  Recently created
                </h2>
                <p className="text-xs text-muted">
                  Your last {recents.length}{" "}
                  {recents.length === 1 ? "link" : "links"}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
            >
              Clear all
            </Button>
          </div>

          <ul className="flex flex-col gap-2">
            {recents.map((item) => (
              <li
                key={item.shortId}
                className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 bg-surface px-3 py-2"
              >
                <div className="flex min-w-0 flex-col leading-tight">
                  <a
                    href={`${window.location.origin}/${item.shortId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-sm font-semibold text-crimson hover:underline"
                  >
                    /{item.shortId}
                  </a>
                  <span
                    className="truncate text-xs text-muted"
                    title={item.originalUrl}
                  >
                    {item.originalUrl}
                  </span>
                </div>
                <Link
                  to="/link-created"
                  state={{
                    shortId: item.shortId,
                    shortUrl: `${window.location.origin}/${item.shortId}`,
                    originalUrl: item.originalUrl,
                  }}
                  aria-label="Open link details"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-white hover:text-crimson"
                >
                  <X className="hidden" aria-hidden />
                  <span aria-hidden>↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default Shorten;
