import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  useActivationMutation,
  useResendActivationMutation,
} from "../../redux/features/auth/authApi";
import { getAuthErrorMessage } from "../../utils/authValidation";
import OtpInput from "../../components/inputs/OtpInput";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60; // matches the server-side cooldown

type VerifyEmailProps = {
  email: string;
  onBack: () => void;
};

const VerifyEmail = ({ email, onBack }: VerifyEmailProps) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const [activation, { isLoading }] = useActivationMutation();
  const [resendActivation, { isLoading: isResending }] =
    useResendActivationMutation();
  const navigate = useNavigate();

  // Resend countdown (a code was just sent when this step opens)
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleOtpChange = (value: string) => {
    setOtp(value);
    // Typing again clears the error state so the next wrong code shakes again
    if (otpError || error) {
      setOtpError(false);
      setError(null);
    }
  };

  const verify = async (code: string) => {
    if (isLoading) return;

    if (code.length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit code`);
      setOtpError(true);
      return;
    }

    setError(null);
    setOtpError(false);

    try {
      await activation({ email, otp: code }).unwrap();
      toast.success("Account activated successfully");
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
      setOtpError(true);
      setOtp("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verify(otp);
  };

  const handleResend = async () => {
    setError(null);
    setOtpError(false);

    try {
      const res = await resendActivation({ email }).unwrap();
      toast.success(res?.message || "A new code has been sent");
      setOtp("");
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    }
  };

  return (
    <div className="w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center">
      <h3 className="text-lg font-semibold text-black">Verify your email</h3>
      <p className="text-xs text-slate-700 mt-[5px] mb-6">
        We sent a {OTP_LENGTH}-digit code to{" "}
        <span className="font-medium text-black">{email}</span>. Enter it below
        to activate your account.
      </p>

      <form onSubmit={handleSubmit}>
        <OtpInput
          value={otp}
          onChange={handleOtpChange}
          onComplete={verify}
          length={OTP_LENGTH}
          disabled={isLoading}
          hasError={otpError}
          autoFocus
        />

        {error && (
          <p className="text-red-500 text-xs pt-3 text-center">{error}</p>
        )}

        <button
          type="submit"
          className="bg-gradient-to-r from-blue-950 to-blue-900 hover:bg-gray-800 transition-all duration-200 hover:scale-105 hover:shadow-lg text-white w-full py-2 my-3 mt-5 text-sm rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || otp.length !== OTP_LENGTH}
        >
          {isLoading ? "Verifying..." : "Verify & Activate"}
        </button>

        <div className="flex items-center justify-between text-[13px] text-slate-800 mt-3">
          <button
            type="button"
            onClick={onBack}
            className="font-medium text-black hover:text-black/80 underline cursor-pointer"
          >
            Use a different email
          </button>

          {secondsLeft > 0 ? (
            <span className="text-slate-500">
              Resend code in {secondsLeft}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
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

export default VerifyEmail;
