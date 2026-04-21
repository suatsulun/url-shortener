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

const Security = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleChangePassword = async (
    e: React.SubmitEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg(null);

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
      setSuccessMsg("Password updated");
    } catch (err: any) {
      setErrors({
        oldPassword: err.response?.data?.error ?? "Failed to change password",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "This will permanently delete your account and all your links. This cannot be undone. Continue?",
    );
    if (!confirmed) return;

    setDeleteError(null);
    setIsDeleting(true);
    try {
      await api.delete("/users/me");
      await logout().catch(() => {});
      navigate("/");
    } catch (err: any) {
      setDeleteError(
        err.response?.data?.error ?? "Failed to delete account",
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto mt-16 flex w-full max-w-xl flex-col gap-6 px-4">
      <Card variant="elevated" padding="lg" className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-crimson">
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

          {successMsg && (
            <p className="text-sm text-emerald">{successMsg}</p>
          )}

          <div className="flex flex-wrap gap-3">
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
        className="flex flex-col gap-4 border border-danger/30"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight text-danger">
            Danger zone
          </h2>
          <p className="text-sm text-muted">
            Deleting your account is permanent. All your short links will be
            removed.
          </p>
        </div>

        {deleteError && (
          <p className="text-sm text-red-600">{deleteError}</p>
        )}

        <div>
          <Button
            type="button"
            variant="destructive"
            loading={isDeleting}
            onClick={handleDeleteAccount}
          >
            Delete account
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Security;
