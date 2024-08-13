import { configureStore } from "@reduxjs/toolkit";
// import addItemFormReducer from "./addItemFormSlicee";
import notificationReducer from "./notificationSlice";
import userReducer from "./userSlice";
import productsReducer from "./products";
import categoriesReducer from "./categories";

const store = configureStore({
  reducer: {
    // addItemForm: addItemFormReducer,
    notification: notificationReducer,
    user: userReducer,
    products: productsReducer,
    categories: categoriesReducer,
  },
});

export default store;
