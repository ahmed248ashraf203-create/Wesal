import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  FaKey,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaShieldHalved,
  FaCircleExclamation,
  FaCircleCheck,
} from "react-icons/fa6";
import { api } from "../../lib/api";
import Seo from "../../components/Seo/Seo";

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const rules = [
    { label: "At least 8 characters", valid: newPassword.length >= 8 },
    { label: "Uppercase letter (A-Z)", valid: /[A-Z]/.test(newPassword) },
    { label: "Lowercase letter (a-z)", valid: /[a-z]/.test(newPassword) },
    { label: "Number (0-9)", valid: /[0-9]/.test(newPassword) },
    {
      label: "Special character (@$!%*?&)",
      valid: /[^A-Za-z0-9]/.test(newPassword),
    },
  ];

  const isPasswordValid = rules.every((rule) => rule.valid);

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch("/users/change-password", {
        password: currentPassword,
        newPassword: newPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setRePassword("");
      setFormError(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!currentPassword) {
      setFormError("Current password is required.");
      return;
    }

    if (!isPasswordValid) {
      setFormError("New password does not meet security requirements.");
      return;
    }

    if (newPassword !== rePassword) {
      setFormError("Passwords do not match.");
      return;
    }

    changePasswordMutation.mutate();
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-gray-50/50 py-10 px-4 sm:px-6">
      <Seo
        title="Change password"
        description="Update your Wesal account password."
        noIndex
      />
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-indigo-950/5">
          {/* Header */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-transparent p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
                <FaShieldHalved className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900">
                  Change Password
                </h1>
                <p className="mt-1 text-sm font-medium text-gray-500">
                  Keep your account secure by using a strong and unique
                  password.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Feedback Alerts */}
            {formError && (
              <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50/80 p-4 text-xs font-semibold text-red-700 animate-in fade-in duration-200">
                <FaCircleExclamation className="text-lg shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            {changePasswordMutation.isError && (
              <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50/80 p-4 text-xs font-semibold text-red-700 animate-in fade-in duration-200">
                <FaCircleExclamation className="text-lg shrink-0 text-red-500" />
                <span>
                  Failed to change password. Please verify your current
                  password.
                </span>
              </div>
            )}

            {changePasswordMutation.isSuccess && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-xs font-semibold text-emerald-700 animate-in fade-in duration-200">
                <FaCircleCheck className="text-lg shrink-0 text-emerald-500" />
                <span>Password updated successfully!</span>
              </div>
            )}

            {/* Current Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="current-password"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700"
              >
                Current Password
              </label>
              <div className="relative flex items-center">
                <FaKey className="absolute left-4 text-gray-400 text-sm" />
                <input
                  id="current-password"
                  autoComplete="current-password"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3.5 pl-11 pr-12 text-sm text-gray-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  aria-label={
                    showCurrent
                      ? "Hide current password"
                      : "Show current password"
                  }
                  className="absolute right-4 text-gray-400 transition-colors hover:text-gray-600"
                >
                  {showCurrent ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="new-password"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700"
              >
                New Password
              </label>
              <div className="relative flex items-center">
                <FaLock className="absolute left-4 text-gray-400 text-sm" />
                <input
                  id="new-password"
                  autoComplete="new-password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3.5 pl-11 pr-12 text-sm text-gray-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  aria-label={
                    showNew ? "Hide new password" : "Show new password"
                  }
                  className="absolute right-4 text-gray-400 transition-colors hover:text-gray-600"
                >
                  {showNew ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Password Strength Checklist */}
              {newPassword && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5">
                  {rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] transition-all ${
                          rule.valid
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        <FaCheck />
                      </span>
                      <span
                        className={
                          rule.valid
                            ? "font-semibold text-emerald-700"
                            : "text-gray-500"
                        }
                      >
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm New Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700"
              >
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <FaLock className="absolute left-4 text-gray-400 text-sm" />
                <input
                  id="confirm-password"
                  autoComplete="new-password"
                  type={showConfirm ? "text" : "password"}
                  value={rePassword}
                  onChange={(e) => setRePassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3.5 pl-11 pr-12 text-sm text-gray-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={
                    showConfirm
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                  className="absolute right-4 text-gray-400 transition-colors hover:text-gray-600"
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-4 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/35 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {changePasswordMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Updating password...</span>
                </div>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
