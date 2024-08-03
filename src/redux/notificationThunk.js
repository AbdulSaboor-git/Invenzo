import { showNotification, hideNotification } from "./notificationSlice";

export const triggerNotification =
  ({ msg, success }) =>
  (dispatch) => {
    dispatch(showNotification({ msg, success }));

    setTimeout(() => {
      dispatch(hideNotification());
    }, 4000);
  };
