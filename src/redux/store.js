import { configureStore } from "@reduxjs/toolkit";
import addItemFormReducer from "./addItemFormSlice";
import notificationReducer from "./notificationSlice";

const store = configureStore({
  reducer: {
    addItemForm: addItemFormReducer,
    notification: notificationReducer,
  },
});

export default store;
