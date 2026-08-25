import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthState } from "../../../@types";

const initialState: AuthState = {
  token: "",
  user: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userRegistration: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
    },
    userLoggedIn: (
      state,
      action: PayloadAction<{ accessToken: string; user: User }>,
    ) => {
      state.token = action.payload.accessToken;
      state.user = action.payload.user;
      state.isInitialized = true;
    },
    userLoggedOut: (state) => {
      state.token = "";
      state.user = null;
      state.isInitialized = true;
    },
    setAuthInitialized: (state) => {
      state.isInitialized = true;
    },
  },
});

export const {
  userRegistration,
  userLoggedIn,
  userLoggedOut,
  setAuthInitialized,
} = authSlice.actions;

export default authSlice.reducer;
