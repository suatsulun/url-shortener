import { useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormError,
} from "@/components/ui/Form";

const Shorten = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const shortenAction = async (formData: FormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const url = formData.get("url") as string;
      const { data } = await api.post("/urls/shorten", { originalUrl: url });
      navigate(`/link-created`, { state: data });
    } catch (err) {
      console.error("Failed to shorten URL", err);
      setError("Failed to shorten URL");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-16 w-full max-w-xl px-4">
      <Card variant="elevated" padding="lg" className="flex flex-col gap-6">
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-center">
            <Button loading={isSubmitting} type="submit">
              Shorten
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Shorten;
