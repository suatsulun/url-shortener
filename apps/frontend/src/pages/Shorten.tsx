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
import { useToast } from "@/components/ui/Toast";

const Shorten = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const shortenAction = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const url = formData.get("url") as string;
      const { data } = await api.post("/urls/shorten", { originalUrl: url });
      toast.success("Link shortened", "Your short URL is ready to share.");
      navigate(`/link-created`, { state: data });
    } catch (err: any) {
      toast.error(
        "Failed to shorten URL",
        err.response?.data?.error ?? "Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-16 w-full max-w-xl px-4">
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
