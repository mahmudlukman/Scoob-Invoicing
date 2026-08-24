import { configureStore } from "@reduxjs/toolkit";

import { apiSlice } from "./features/api/apiSlice";
import authSlice from "./features/auth/authSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authSlice,
  },

  devTools: import.meta.env.VITE_NODE_ENV !== "production",

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

/* -------------------------------------------------------------------------- */
/* Initialize Authentication                                                  */
/* -------------------------------------------------------------------------- */

const initializeApp = async () => {
  try {
    await store.dispatch(
      apiSlice.endpoints.loadUser.initiate(undefined, {
        forceRefetch: true,
      }),
    );
  } catch (error) {
    console.error("Failed to initialize authentication:", error);
  }
};

initializeApp();

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
