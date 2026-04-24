import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormError,
  FormDescription,
} from "@/components/ui/Form";

const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const crossFieldErrors: Record<string, string> = {};
    if (email !== emailConfirm)
      crossFieldErrors.emailConfirm = "Emails don't match";
    if (password !== passwordConfirm)
      crossFieldErrors.passwordConfirm = "Passwords don't match";
    if (Object.keys(crossFieldErrors).length > 0) {
      setErrors(crossFieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await register(username, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setErrors({
        username: err.response?.data?.error ?? "Registration failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} errors={errors}>
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
        <FormDescription>3–20 letters, numbers, or underscores</FormDescription>
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

      <FormField name="emailConfirm">
        <FormLabel>Confirm email</FormLabel>
        <FormControl
          type="email"
          value={emailConfirm}
          onChange={(e) => setEmailConfirm(e.target.value)}
          required
        />
        <FormError />
      </FormField>

      <FormField name="password">
        <FormLabel>Password</FormLabel>
        <FormControl
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          pattern="(?=.*[A-Za-z])(?=.*\d).{8,}"
        />
        <FormDescription>
          At least 8 characters, 1 letter + 1 number
        </FormDescription>
        <FormError />
      </FormField>

      <FormField name="passwordConfirm">
        <FormLabel>Confirm password</FormLabel>
        <FormControl
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
        />
        <FormError />
      </FormField>

      <Button type="submit" loading={isSubmitting} className="mt-2">
        Register
      </Button>
    </Form>
  );
};

export default RegisterForm;
