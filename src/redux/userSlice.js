// redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  userLoading: true, // default true until checked
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setUserLoading: (state, action) => {
      state.userLoading = action.payload;
    },
    logoutUser: (state) => {
      state.user = null;
      state.userLoading = false;
    },
  },
});

export const { setUser, setUserLoading, logoutUser } = userSlice.actions;
export default userSlice.reducer;
