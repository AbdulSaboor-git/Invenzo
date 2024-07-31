import { createSlice } from "@reduxjs/toolkit";

const addItemFormSlice = createSlice({
  name: "addItemForm",
  initialState: {
    isOpen: false,
    heading: "",
    btn_text: "",
  },
  reducers: {
    openAddItemForm: (state, action) => {
      state.isOpen = true;
      state.heading = action.payload.heading;
      state.btn_text = action.payload.btn_text;
    },
    closeAddItemForm: (state) => {
      state.isOpen = false;
      state.heading = "";
      state.btn_text = "";
    },
  },
});

export const { openAddItemForm, closeAddItemForm } = addItemFormSlice.actions;
export default addItemFormSlice.reducer;
