import { createSlice } from "@reduxjs/toolkit";

const productsSlice = createSlice({
  name: "products",
  initialState: [],
  reducers: {
    setProducts: (state, action) => action.payload,
    clearProducts: () => [],
  },
});

export const { setProducts, clearProducts } = productsSlice.actions;

export default productsSlice.reducer;
