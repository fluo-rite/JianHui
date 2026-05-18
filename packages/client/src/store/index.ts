import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";
import componentsReducer from "./components";
import pageReducer from "./page";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    page: pageReducer,
    components: componentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export * from "./auth";
export * from "./components";
export * from "./page";
