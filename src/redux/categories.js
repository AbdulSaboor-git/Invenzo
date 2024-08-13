import { createSlice } from "@reduxjs/toolkit";

const categoriesSlice = createSlice({
  name: "categories",
  initialState: [],
  reducers: {
    setCategories: (state, action) => action.payload,
    clearCategories: () => [],
  },
});

export const { setCategories, clearCategories } = categoriesSlice.actions;

export default categoriesSlice.reducer;
