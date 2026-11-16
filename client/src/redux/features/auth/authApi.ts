import { apiSlice } from "../api/apiSlice";
import { userLoggedOut, userLoggedIn } from "./authSlice";
import type { User } from "../../../@types";

type RegistrationResponse = {
  success: boolean;
  message: string;
};

type RegistrationData = {
  name: string;
  email: string;
  password: string;
};

type ActivationData = {
  email: string;
  otp: string;
};

type ActivationResponse = {
  success: boolean;
  accessToken: string;
  user: User;
};

type ResendActivationData = {
  email: string;
};

type LoginData = {
  email: string;
  password: string;
};

type LoginResponse = {
  success: boolean;
  accessToken: string;
  user: User;
};

type ForgotPasswordData = {
  email: string;
};

type ResetPasswordData = {
  email: string;
  otp: string;
  newPassword: string;
};

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegistrationResponse, RegistrationData>({
      query: (data) => ({
        url: "register",
        method: "POST",
        body: data,
      }),
    }),

    activation: builder.mutation<ActivationResponse, ActivationData>({
      query: ({ email, otp }) => ({
        url: "activate-user",
        method: "POST",
        body: { email, otp },
      }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken,
              user: result.data.user,
            }),
          );
        } catch (error: unknown) {
          console.log(error);
        }
      },
    }),

    resendActivation: builder.mutation<
      { success: boolean; message: string },
      ResendActivationData
    >({
      query: ({ email }) => ({
        url: "resend-activation",
        method: "POST",
        body: { email },
      }),
    }),

    login: builder.mutation<LoginResponse, LoginData>({
      query: ({ email, password }) => ({
        url: "login",
        method: "POST",
        body: { email, password },
      }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken,
              user: result.data.user,
            }),
          );
        } catch (error: unknown) {
          console.log(error);
        }
      },
    }),

    forgotPassword: builder.mutation<
      { success: boolean; message: string },
      ForgotPasswordData
    >({
      query: ({ email }) => ({
        url: "forgot-password",
        method: "POST",
        body: { email },
      }),
    }),

    resetPassword: builder.mutation<
      { success: boolean; message: string },
      ResetPasswordData
    >({
      query: ({ email, otp, newPassword }) => ({
        url: "reset-password",
        method: "POST",
        body: { email, otp, newPassword },
      }),
    }),

    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: "logout", method: "GET" }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          dispatch(userLoggedOut());
          dispatch(apiSlice.util.resetApiState());
        } catch (error: unknown) {
          console.log(error);
        }
      },
    }),
  }),
});

export const {
  useLogoutMutation,
  useLoginMutation,
  useRegisterMutation,
  useActivationMutation,
  useResendActivationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
