import React, { useState } from "react";
import { useForgotPasswordMutation } from "../../redux/features/auth/authApi";
import {
  validateForgotPasswordForm,
  getAuthErrorMessage,
} from "../../utils/authValidation";
import Input from "../../components/inputs/Input";

interface ForgotPasswordProps {
  setCurrentPage: (page: string) => void;
}

const ForgotPassword = ({ setCurrentPage }: ForgotPasswordProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForgotPasswordForm(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    try {
      const res = await forgotPassword({ email: email.trim() }).unwrap();
      setSuccess(res?.message || "Password reset link sent! Check your inbox.");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    }
  };

  return (
    <div className="w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center">
      <h3 className="text-lg font-semibold text-black">Welcome Back</h3>
      <p className="text-xs text-slate-700 mt-[5px] mb-6">
        Please enter your email to reset your password
      </p>

      <form onSubmit={handleSubmit}>
        <Input
          value={email}
          onChange={({ target }) => setEmail(target.value)}
          label="Email Address"
          placeholder="john@example.com"
          type="email"
        />

        {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}
        {success && (
          <p className="text-green-600 text-xs pb-2.5 py-2">{success}</p>
        )}

        <button
          type="submit"
          className="bg-gradient-to-r from-blue-950 to-blue-900 hover:bg-gray-800 transition-all duration-200 hover:scale-105 hover:shadow-lg text-white w-full py-2 my-3 text-sm rounded-md cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send Reset Password Link"}
        </button>

        <p className="text-[13px] text-slate-800 mt-3">
          Remembered your password?{" "}
          <button
            type="button"
            className="font-medium text-black hover:text-black/80 underline cursor-pointer"
            onClick={() => setCurrentPage("login")}
          >
            Back to Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
