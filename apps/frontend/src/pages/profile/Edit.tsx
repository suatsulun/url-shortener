import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormError,
  FormDescription,
} from "@/components/ui/Form";
import type { User } from "@/context/AuthContext";

const Edit = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const isUnchanged = username === user.username && email === user.email;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: Partial<Pick<User, "username" | "email">> = {};
    if (username !== user.username) payload.username = username;
    if (email !== user.email) payload.email = email;

    try {
      const { data } = await api.patch<User>("/users/me", payload);
      updateUser(data);
      navigate("/profile");
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-16 w-full max-w-xl px-4">
      <Card variant="elevated" padding="lg" className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-crimson">
            Edit profile
          </h1>
          <p className="text-sm text-muted">
            Update your username or email address.
          </p>
        </div>

        <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField name="username">
            <FormLabel>Username</FormLabel>
            <FormControl
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
            />
            <FormDescription>
              3–20 letters, numbers, or underscores
            </FormDescription>
            <FormError />
          </FormField>

          <FormField name="email">
            <FormLabel>Email</FormLabel>
            <FormControl
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FormError />
          </FormField>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isUnchanged}
            >
              Save
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/profile")}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Edit;
