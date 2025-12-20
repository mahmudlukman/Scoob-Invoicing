import { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useActivationMutation } from "../../redux/features/auth/authApi";
import type { ServerError } from "../../@types";
import Loading from "../../components/ui/Loading";

const Activation = () => {
  const { activation_token } = useParams<{ activation_token: string }>();
  const navigate = useNavigate();
  const [activation, { isLoading, isSuccess, isError }] =
    useActivationMutation();

  const onSubmit = useCallback(async () => {
    if (!activation_token) {
      toast.error("Missing token");
      return;
    }

    try {
      const result = await activation({ activation_token }).unwrap();
      toast.success(result.message || "Account activated successfully");
    } catch (err: unknown) {
      const serverError = err as ServerError;
      const errorMessage =
        serverError.data?.message || serverError.message || "Activation failed";
      toast.error(errorMessage);
    }
  }, [activation_token, activation]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  const handleRedirect = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full text-center space-y-6">
        {isLoading ? (
          <>
            <Loading />
            <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800">
              Activating your account...
            </p>
          </>
        ) : isError ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-800">
              Activation Failed
            </p>
            <p className="text-gray-600">
              Please try again or contact support for assistance.
            </p>
            <button
              onClick={handleRedirect}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              Go Back Home
            </button>
          </div>
        ) : isSuccess ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-800">
              Activation Successful!
            </p>
            <p className="text-gray-600">
              Your account has been activated. You can now log in and start using the platform.
            </p>
            <button
              onClick={handleRedirect}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-800">
              Waiting for activation...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activation;