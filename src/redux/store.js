import { configureStore } from "@reduxjs/toolkit";
import addItemFormReducer from "./addItemFormSlice";
import notificationReducer from "./notificationSlice";
import userReducer from "./userSlice";

const store = configureStore({
  reducer: {
    addItemForm: addItemFormReducer,
    notification: notificationReducer,
    user: userReducer,
  },
});

export default store;
