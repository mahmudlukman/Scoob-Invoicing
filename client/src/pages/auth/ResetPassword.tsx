import React, { useState, useEffect } from "react";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "../../redux/features/auth/authApi";
import {
  validatePassword,
  validateConfirmPassword,
  getAuthErrorMessage,
} from "../../utils/authValidation";
import toast from "react-hot-toast";
import Input from "../../components/inputs/Input";
import OtpInput from "../../components/inputs/OtpInput";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60; // matches the server-side cooldown

type ResetPasswordProps = {
  email: string; // the email the reset code was sent to
  onDone: () => void; // called after a successful reset (e.g. go to login)
  onBack?: () => void; // optional: go back to the forgot-password step
};

const ResetPassword = ({ email, onDone, onBack }: ResetPasswordProps) => {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [forgotPassword, { isLoading: isResending }] =
    useForgotPasswordMutation();

  // Resend countdown (a code was just sent when this step opens)
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  // Move on after a successful reset
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [success, onDone]);

  const handleOtpChange = (value: string) => {
    setOtp(value);
    // Typing again clears the red state so the next wrong code shakes again
    if (otpError) setOtpError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit code`);
      setOtpError(true);
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
    setOtpError(false);

    try {
      const res = await resetPassword({
        email,
        otp,
        newPassword: password,
      }).unwrap();

      setSuccess(res?.message || "Password reset successful!");
    } catch (err: unknown) {
      const message = getAuthErrorMessage(err);
      setError(message);

      // Only mark the code boxes red when the problem is the code itself
      // (not, for example, "new password must be different")
      if (/code|attempt/i.test(message)) {
        setOtpError(true);
        setOtp("");
      }
    }
  };

  const handleResend = async () => {
    setError(null);
    setOtpError(false);

    try {
      await forgotPassword({ email }).unwrap();
      toast.success("If your account exists, a new code has been sent");
      setOtp("");
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    }
  };

  const disabled = isLoading || !!success;

  return (
    <div className="w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center">
      <h3 className="text-lg font-semibold text-black">Reset Password</h3>
      <p className="text-xs text-slate-700 mt-[5px] mb-6">
        Enter the {OTP_LENGTH}-digit code sent to{" "}
        <span className="font-medium text-black">{email}</span> and choose a new
        password.
      </p>

      <form onSubmit={handleSubmit}>
        <label className="block text-[13px] text-slate-800 mb-2">
          Reset Code
        </label>
        <div className="mb-4">
          <OtpInput
            value={otp}
            onChange={handleOtpChange}
            length={OTP_LENGTH}
            disabled={disabled}
            hasError={otpError}
            autoFocus
          />
        </div>

        <Input
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          label="New Password"
          placeholder="Min 6 Characters"
          type="password"
          disabled={disabled}
        />

        <Input
          value={confirmPassword}
          onChange={({ target }) => setConfirmPassword(target.value)}
          label="Confirm Password"
          placeholder="Re-enter your password"
          type="password"
          disabled={disabled}
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
          disabled={disabled}
        >
          {isLoading ? "Resetting Password..." : "Reset Password"}
        </button>

        <div className="flex items-center justify-between text-[13px] text-slate-800 mt-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              disabled={disabled}
              className="font-medium text-black hover:text-black/80 underline cursor-pointer disabled:opacity-50"
            >
              Use a different email
            </button>
          ) : (
            <span />
          )}

          {secondsLeft > 0 ? (
            <span className="text-slate-500">
              Resend code in {secondsLeft}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || disabled}
              className="font-medium text-black hover:text-black/80 underline cursor-pointer disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend code"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
