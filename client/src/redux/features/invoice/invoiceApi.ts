import type { Invoice } from "../../../@types";
import { apiSlice } from "../api/apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createInvoice: builder.mutation({
      query: (data) => ({
        url: "create-invoice",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Invoice", id: "LIST" }],
    }),
    getAllInvoices: builder.query<{ invoices: Invoice[] }, void>({
      query: () => ({
        url: "invoices",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: [{ type: "Invoice", id: "LIST" }],
    }),
    getInvoice: builder.query({
      query: (id) => ({
        url: `invoice/${id}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: [{ type: "Invoice", id: "LIST" }],
    }),
    updateInvoice: builder.mutation({
      query: ({ data, id }) => ({
        url: `update-invoice/${id}`,
        method: "PUT",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Invoice", id: "LIST" }],
    }),
    updateInvoicePreferences: builder.mutation({
      query: (data) => ({
        url: "/update-invoice-preferences",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteInvoice: builder.mutation({
      query: (id) => ({
        url: `delete-invoice/${id}`,
        method: "DELETE",
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Invoice", id: "LIST" }],
    }),
  }),
});

export const {
  useCreateInvoiceMutation,
  useGetAllInvoicesQuery,
  useGetInvoiceQuery,
  useUpdateInvoiceMutation,
  useUpdateInvoicePreferencesMutation,
  useDeleteInvoiceMutation,
} = userApi;
