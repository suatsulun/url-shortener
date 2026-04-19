import {useState} from "react";
import { api } from "../lib/api";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormError,
} from "@/components/ui/Form";
import { useNavigate } from "react-router";

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
    <Form action={shortenAction}>
      <FormField>
        <FormLabel>Enter URL to shorten</FormLabel>
        <FormControl
          type="url"
          name="url"
          placeholder="https://example.com"
          required
        />
        <FormError/>
      </FormField>
      <Button loading={isSubmitting} type="submit" className="mt-4">Shorten</Button>
    </Form>
  );
};

export default Shorten;
