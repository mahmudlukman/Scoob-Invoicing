import type { Invoice } from "../../../@types";
import { apiSlice } from "../api/apiSlice";

interface IncomeByMonthItem {
  _id: { year: number; month: number };
  income: number;
  invoiceCount: number;
}

interface IncomeByMonthResponse {
  success: boolean;
  incomeByMonth: IncomeByMonthItem[];
}

interface AddPaymentPayload {
  invoiceId: string;
  data: {
    amount: number;
    date?: string;
    method?: string;
    note?: string;
  };
}

interface DeletePaymentPayload {
  invoiceId: string;
  paymentId: string;
}

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
    duplicateInvoice: builder.mutation({
      query: (id) => ({
        url: `duplicate-invoice/${id}`,
        method: "POST",
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
      invalidatesTags: ["Invoice"],
    }),
    getIncomeByMonth: builder.query<
      IncomeByMonthResponse,
      { months?: number } | void
    >({
      query: (params) => ({
        url: "income-by-month",
        method: "GET",
        params: params?.months ? { months: params.months } : undefined,
        credentials: "include" as const,
      }),
      providesTags: [{ type: "Invoice", id: "LIST" }],
    }),
    deleteInvoice: builder.mutation({
      query: (id) => ({
        url: `delete-invoice/${id}`,
        method: "DELETE",
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Invoice", id: "LIST" }],
    }),
    addPayment: builder.mutation<
      { success: boolean; invoice: Invoice },
      AddPaymentPayload
    >({
      query: ({ invoiceId, data }) => ({
        url: `invoices/${invoiceId}/payments`,
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Invoice", id: "LIST" }],
    }),

    deletePayment: builder.mutation<
      { success: boolean; invoice: Invoice },
      DeletePaymentPayload
    >({
      query: ({ invoiceId, paymentId }) => ({
        url: `invoices/${invoiceId}/payments/${paymentId}`,
        method: "DELETE",
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Invoice", id: "LIST" }],
    }),
    sendReceipt: builder.mutation<
      { success: boolean; message: string },
      { invoiceId: string; email?: string }
    >({
      query: ({ invoiceId, email }) => ({
        url: `send-receipt/${invoiceId}`,
        method: "POST",
        body: { email },
        credentials: "include" as const,
      }),
    }),
  }),
});

export const {
  useCreateInvoiceMutation,
  useGetAllInvoicesQuery,
  useGetInvoiceQuery,
  useUpdateInvoiceMutation,
  useDuplicateInvoiceMutation,
  useUpdateInvoicePreferencesMutation,
  useGetIncomeByMonthQuery,
  useDeleteInvoiceMutation,
  useAddPaymentMutation,
  useDeletePaymentMutation,
  useSendReceiptMutation,
} = userApi;
