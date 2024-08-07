"use client";
import React from "react";
import { Provider } from "react-redux";
import store from "../redux/store";
import Notification from "@/components/notification";

const ReduxProvider = ({ children }) => {
  return (
    <Provider store={store}>
      {children}
      <Notification />
    </Provider>
  );
};

export default ReduxProvider;
