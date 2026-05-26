import type { TPageStatus } from "@lowcode/share";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface TStorePage {
  id: number | null;
  title: string;
  description: string;
  tdk: string;
  status: TPageStatus | null;
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
  closedAt: string | null;
}

const initialState: TStorePage = {
  id: null,
  title: "未命名页面",
  description: "",
  tdk: "",
  status: null,
  createdAt: null,
  updatedAt: null,
  publishedAt: null,
  closedAt: null,
};

const pageSlice = createSlice({
  name: "page",
  initialState,
  reducers: {
    setPageTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
    },
    updatePage(state, action: PayloadAction<Partial<TStorePage>>) {
      Object.assign(state, action.payload);
    },
    replacePage(_, action: PayloadAction<TStorePage>) {
      return action.payload;
    },
    resetPage() {
      return initialState;
    },
  },
});

export const pageActions = pageSlice.actions;

export default pageSlice.reducer;
