import { apiSlice } from "../api/apiSlice";

export interface Customer {
  _id: string;
  user: string;
  clientName: string;
  email?: string;
  address?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateCustomerPayload {
  clientName: string;
  email?: string;
  address?: string;
  phone?: string;
}

interface UpdateCustomerPayload {
  id: string;
  data: CreateCustomerPayload;
}

interface CustomerResponse {
  success: boolean;
  customer: Customer;
}

interface CustomersListResponse {
  success: boolean;
  customers: Customer[];
}

export const customerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCustomer: builder.mutation<CustomerResponse, CreateCustomerPayload>({
      query: (data) => ({
        url: "create-customer",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Customer", id: "LIST" }],
    }),

    getCustomers: builder.query<CustomersListResponse, void>({
      query: () => ({
        url: "customers",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.customers.map(({ _id }) => ({
                type: "Customer" as const,
                id: _id,
              })),
              { type: "Customer", id: "LIST" },
            ]
          : [{ type: "Customer", id: "LIST" }],
    }),

    updateCustomer: builder.mutation<CustomerResponse, UpdateCustomerPayload>({
      query: ({ id, data }) => ({
        url: `update-customer/${id}`,
        method: "PUT",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Customer", id },
        { type: "Customer", id: "LIST" },
      ],
    }),

    deleteCustomer: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `delete-customer/${id}`,
        method: "DELETE",
        credentials: "include" as const,
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Customer", id },
        { type: "Customer", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreateCustomerMutation,
  useGetCustomersQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customerApi;
