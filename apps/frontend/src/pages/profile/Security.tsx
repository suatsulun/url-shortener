import { useEffect, useRef, useState } from "react";
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
import { useToast } from "@/components/ui/Toast";

const Security = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [remaining, setRemaining] = useState<number | null >(null);
  const [armed, setArmed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleChangePassword = async (
    e: React.SubmitEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setErrors({});

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords don't match" });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.patch("/users/me/password", { oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    } catch (err: any) {
      setErrors({
        oldPassword: err.response?.data?.error ?? "Failed to change password",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.delete("/users/me");
      await logout().catch(() => {});
      toast.success("Account deleted");
      navigate("/");
    } catch (err: any) {
      toast.error(
        "Failed to delete account",
        err.response?.data?.error ?? "Please try again.",
      );
      setIsDeleting(false);
    }
  };

  const handleMouseEnter = () => {
    if (armed) return;
    setRemaining(3);
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r === 1) {
          setArmed(true);
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return null;
        }
        return (r ? r - 1 : null);
      });
    }, 1000);
    intervalRef.current = interval;
  };

  const handleMouseLeave = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRemaining(null);
    setArmed(false);
  };

  const handleClick = () => {
    if (!armed) return;
    handleDeleteAccount();
  };

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    [],
  );

  return (
    <div className="mx-auto mt-16 flex w-full max-w-xl flex-col gap-6 px-4">
      <Card
        variant="elevated"
        padding="lg"
        className="flex flex-col gap-6  border-crimson border-2"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-crimson flex justify-center">
            Change password
          </h1>
          <p className="text-sm text-muted">
            You'll need to enter your current password to set a new one.
          </p>
        </div>

        <Form
          onSubmit={handleChangePassword}
          errors={errors}
          className="flex flex-col gap-4"
        >
          <FormField name="oldPassword">
            <FormLabel>Current password</FormLabel>
            <FormControl
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <FormError />
          </FormField>

          <FormField name="newPassword">
            <FormLabel>New password</FormLabel>
            <FormControl
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              pattern="(?=.*[A-Za-z])(?=.*\d).{8,}"
            />
            <FormDescription>
              At least 8 characters, 1 letter + 1 number
            </FormDescription>
            <FormError />
          </FormField>

          <FormField name="confirmPassword">
            <FormLabel>Confirm new password</FormLabel>
            <FormControl
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <FormError />
          </FormField>

          <div className="flex flex-wrap justify-end gap-26">
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Update password
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/profile")}
            >
              Back
            </Button>
          </div>
        </Form>
      </Card>

      <Card
        variant="elevated"
        padding="lg"
        className="flex flex-col gap-4 border bg-danger/80 text-white"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight text-white flex justify-center">
            Danger zone
          </h2>
          <p className="text-sm text-white">
            Deleting your account is permanent. All your short links will be
            removed.
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            type="button"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            variant={armed ? "destructive" : "ghost"}
            className={`min-w-35 ${!armed ? "opacity-100 border-white border-2 text-white" : ""}`}
            aria-disabled={!armed}
            loading={isDeleting}
          >
            {armed
              ? "Delete account"
              : remaining !== null
                ? `Hold... ${remaining}`
                : "Hover to delete"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Security;
