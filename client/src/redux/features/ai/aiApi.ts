import { apiSlice } from "../api/apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    parseInvoiceFromText: builder.mutation({
      query: (data) => ({
        url: "parse-text",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Ai", id: "LIST" }],
    }),
    generateReminderEmail: builder.mutation({
      query: (data) => ({
        url: "generate-reminder",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Ai", id: "LIST" }],
    }),
    sendReminderEmail: builder.mutation({
      query: (data) => ({
        url: "send-reminder-email",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Ai", id: "LIST" }],
    }),
    getDashboardSummary: builder.query({
      query: () => ({
        url: "dashboard-summary",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: [{ type: "Ai", id: "LIST" }],
    }),
  }),
});

export const {
  useParseInvoiceFromTextMutation,
  useGenerateReminderEmailMutation,
  useSendReminderEmailMutation,
  useGetDashboardSummaryQuery,
} = userApi;
