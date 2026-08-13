import { apiSlice } from "../api/apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateUserPassword: builder.mutation({
      query: ({ oldPassword, newPassword }) => ({
        url: "update-user-password",
        method: "PUT",
        body: {
          oldPassword,
          newPassword,
        },
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    getAllUsers: builder.query({
      query: ({
        page = 1,
        pageSize = 10,
        search = "",
        role = "all",
        isActive = "all",
      }) => ({
        url: `get-users?page=${page}&pageSize=${pageSize}&search=${search}&role=${role}&isActive=${isActive}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: [{ type: "User", id: "LIST" }],
    }),
    getUser: builder.query({
      query: (id) => ({
        url: `get-user${id}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: [{ type: "User", id: "LIST" }],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `delete-user/${id}`,
        method: "DELETE",
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    updateUserStatus: builder.mutation({
      query: ({ data }) => ({
        url: "update-user-status",
        method: "PUT",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    updateUserProfile: builder.mutation({
      query: ({ data }) => ({
        url: "update-user-profile",
        method: "PUT",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    // add to userApi.ts
    deleteAccount: builder.mutation<
      { success: boolean; message: string },
      { password: string }
    >({
      query: (data) => ({
        url: "delete-account",
        method: "DELETE",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    // add to userApi.ts
    deactivateAccount: builder.mutation<
      { success: boolean; message: string },
      { password: string }
    >({
      query: (data) => ({
        url: "deactivate-account",
        method: "PATCH",
        body: data,
        credentials: "include" as const,
      }),
    }),

    reactivateAccount: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({
        url: "reactivate-account",
        method: "PATCH",
        credentials: "include" as const,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useDeleteUserMutation,
  useDeleteAccountMutation,
  useDeactivateAccountMutation,
  useReactivateAccountMutation,
  useGetAllUsersQuery,
  useGetUserQuery,
  useUpdateUserPasswordMutation,
  useUpdateUserStatusMutation,
  useUpdateUserProfileMutation,
} = userApi;
