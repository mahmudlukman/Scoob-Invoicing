import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../auth/authSlice";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import type { LoadUserResponse, RefreshTokenResponse } from "../../../@types";

const baseQuery = fetchBaseQuery({
  baseUrl:
    import.meta.env.VITE_PUBLIC_SERVER_URI || "http://localhost:8000/api/v1/",
  credentials: "include",
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshResult = await baseQuery(
      { url: "refresh-token", method: "POST" },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const { accessToken, user } = refreshResult.data as RefreshTokenResponse;
      api.dispatch(userLoggedIn({ accessToken, user }));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(userLoggedOut());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  tagTypes: ["User", "Invoice", "Customer", "Ai", "Analytics"],
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    loadUser: builder.query<LoadUserResponse, void>({
      query: () => ({ url: "me", method: "GET" }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken || "",
              user: result.data.user,
            }),
          );
        } catch {
          dispatch(userLoggedOut());
        }
      },
      providesTags: ["User"],
    }),

    refreshToken: builder.mutation<RefreshTokenResponse, void>({
      query: () => ({ url: "refresh-token", method: "POST" }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken,
              user: result.data.user,
            }),
          );
        } catch {
          dispatch(userLoggedOut());
        }
      },
    }),
  }),
});

export const { useLoadUserQuery, useRefreshTokenMutation } = apiSlice;
