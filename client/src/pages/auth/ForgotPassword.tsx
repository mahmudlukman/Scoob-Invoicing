import React, { useCallback, useState } from "react";
import { useForgotPasswordMutation } from "../../redux/features/auth/authApi";
import {
  validateForgotPasswordForm,
  getAuthErrorMessage,
} from "../../utils/authValidation";
import Input from "../../components/inputs/Input";
import ResetPassword from "./ResetPassword";

interface ForgotPasswordProps {
  setCurrentPage: (page: string) => void;
}

const ForgotPassword = ({ setCurrentPage }: ForgotPasswordProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"email" | "reset">("email");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleBack = useCallback(() => setStep("email"), []);
  const handleDone = useCallback(
    () => setCurrentPage("login"),
    [setCurrentPage],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForgotPasswordForm(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    try {
      await forgotPassword({ email: email.trim().toLowerCase() }).unwrap();
      // The server always answers with the same generic message, whether or
      // not the account exists, so we always continue to the code step.
      setStep("reset");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    }
  };

  if (step === "reset") {
    return (
      <ResetPassword
        email={email.trim().toLowerCase()}
        onBack={handleBack}
        onDone={handleDone}
      />
    );
  }

  return (
    <div className="w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center">
      <h3 className="text-lg font-semibold text-black">Welcome Back</h3>
      <p className="text-xs text-slate-700 mt-[5px] mb-6">
        Enter your email and we'll send you a 6-digit code to reset your
        password
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

        <button
          type="submit"
          className="bg-gradient-to-r from-blue-950 to-blue-900 hover:bg-gray-800 transition-all duration-200 hover:scale-105 hover:shadow-lg text-white w-full py-2 my-3 text-sm rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send Reset Code"}
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
