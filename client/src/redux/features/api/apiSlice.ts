import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import {
  userLoggedIn,
  userLoggedOut,
  setAuthInitialized,
} from "../auth/authSlice";

import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

import type { User } from "../../../@types";

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

  if (result.error && result.error.status === 401) {
    const refreshResult = await baseQuery(
      {
        url: "refresh-token",
        method: "POST",
        credentials: "include",
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const refreshData = refreshResult.data as {
        accessToken: string;
        user: User;
      };

      api.dispatch(
        userLoggedIn({
          accessToken: refreshData.accessToken,
          user: refreshData.user,
        }),
      );

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
    loadUser: builder.query<
      {
        accessToken?: string;
        user: User;
      },
      void
    >({
      query: () => ({
        url: "me",
        method: "GET",
        credentials: "include",
      }),

      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;

          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken || "",
              user: result.data.user,
            }),
          );
        } catch (error) {
          console.error("loadUser error:", error);
          dispatch(setAuthInitialized());
        }
      },

      providesTags: ["User"],
    }),

    refreshToken: builder.mutation<
      {
        accessToken: string;
        user: User;
      },
      void
    >({
      query: () => ({
        url: "refresh-token",
        method: "POST",
        credentials: "include",
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
        } catch (error) {
          console.error("refreshToken error:", error);

          dispatch(userLoggedOut());
        }
      },
    }),
  }),
});

export const { useLoadUserQuery, useRefreshTokenMutation } = apiSlice;
