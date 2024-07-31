import { configureStore } from "@reduxjs/toolkit";
import addItemFormReducer from "./addItemFormSlice";

const store = configureStore({
  reducer: {
    addItemForm: addItemFormReducer,
  },
});

export default store;
