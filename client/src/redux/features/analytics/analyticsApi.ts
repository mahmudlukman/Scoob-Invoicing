import { apiSlice } from "../api/apiSlice";

export const analyticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAnalytics: builder.query({
      query: () => ({
        url: "analytics",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: [{ type: "Analytics", id: "LIST" }],
    }),
  }),
});

export const { useGetAnalyticsQuery } = analyticsApi;
