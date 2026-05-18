import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface TStoreAuth {
  token: string;
  details: unknown | null;
}

const initialState: TStoreAuth = {
  token: localStorage.getItem("token") ?? "",
  details: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    setDetails(state, action: PayloadAction<unknown | null>) {
      state.details = action.payload;
    },
    clearAuth(state) {
      state.token = "";
      state.details = null;
    },
  },
});

export const authActions = authSlice.actions;

export default authSlice.reducer;
