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
} from "@/components/ui/Form";

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);
    try {
      await login(loginName, password);
      navigate("/dashboard");
    } catch {
      setErrors({ loginName: "Invalid username, email, or password" });
    } finally {
      setIsSubmitting(false);
      setPassword("");
      setLoginName("");
    }
  };

  return (
    <Form onSubmit={handleSubmit} errors={errors}>
      <FormField name="loginName">
        <FormLabel>Username or email</FormLabel>
        <FormControl
          type="text"
          placeholder="yourname / you@example.com"
          value={loginName}
          onChange={(e) => setLoginName(e.target.value)}
          required
        />
        <FormError className="text-lg text-white" />
      </FormField>

      <FormField name="password">
        <FormLabel>Password</FormLabel>
        <FormControl
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FormError />
      </FormField>

      <Button type="submit" variant="secondary" loading={isSubmitting} className="mt-2">
        Sign in
      </Button>
    </Form>
  );
};

export default LoginForm;
