import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useResetPasswordMutation } from "../../redux/features/auth/authApi";
import {
  validatePassword,
  validateConfirmPassword,
  getAuthErrorMessage,
} from "../../utils/authValidation";
import toast from "react-hot-toast";
import Input from "../../components/inputs/Input";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [searchParams] = useSearchParams();
  const token = searchParams?.get("token");
  const userId = searchParams?.get("id");
  const navigate = useNavigate();

  // Bail out immediately if the link itself is malformed, instead of
  // letting the user fill out the form first and only finding out on submit.
  useEffect(() => {
    if (!token || !userId) {
      toast.error("Invalid reset password link!");
      navigate("/");
    }
  }, [token, userId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !userId) {
      setError("Invalid reset password link.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    const confirmError = validateConfirmPassword(password, confirmPassword);
    if (confirmError) {
      setError(confirmError);
      return;
    }

    setError(null);

    try {
      const res = await resetPassword({
        userId,
        token,
        newPassword: password,
      }).unwrap();

      setSuccess(res?.message || "Password reset successful!");

      // redirect after short delay
      setTimeout(() => navigate("/"), 3000);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-7">
        <h3 className="text-lg font-semibold text-black text-center">
          Reset Password
        </h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6 text-center">
          Please enter your new password details
        </p>

        <form onSubmit={handleSubmit}>
          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="New Password"
            placeholder="Min 6 Characters"
            type="password"
            disabled={isLoading || !!success}
          />

          <Input
            value={confirmPassword}
            onChange={({ target }) => setConfirmPassword(target.value)}
            label="Confirm Password"
            placeholder="Re-enter your password"
            type="password"
            disabled={isLoading || !!success}
          />

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}
          {success && (
            <p className="text-green-600 text-xs pb-2.5 py-2">
              {success} Redirecting you shortly...
            </p>
          )}

          <button
            type="submit"
            className="bg-gradient-to-r from-blue-950 to-blue-900 hover:bg-gray-800 transition-all duration-200 hover:scale-105 hover:shadow-lg text-white w-full py-2 my-3 text-sm rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !!success}
          >
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
