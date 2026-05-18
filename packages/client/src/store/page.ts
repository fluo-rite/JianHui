import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface TStorePage {
  title: string;
  description: string;
  tdk: string;
}

const initialState: TStorePage = {
  title: "简汇页面",
  description: "简汇页面详情",
  tdk: "简汇,低代码,问卷,页面搭建,表单",
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
  },
});

export const pageActions = pageSlice.actions;

export default pageSlice.reducer;
