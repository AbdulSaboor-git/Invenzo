import { showNotification, hideNotification } from "./notificationSlice";

let FeedbackTimeout;

export const triggerNotification =
  ({ msg, success }) =>
  async (dispatch) => {
    if (FeedbackTimeout) {
      clearTimeout(FeedbackTimeout);
      await dispatch(hideNotification());
    }

    dispatch(showNotification({ msg, success }));

    FeedbackTimeout = setTimeout(() => {
      dispatch(hideNotification());
      FeedbackTimeout = null;
    }, 5000);
  };
