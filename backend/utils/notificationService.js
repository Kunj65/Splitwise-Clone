export const requestNotificationPermission =
  async () => {
    if ("Notification" in window) {
      return Notification.requestPermission();
    }
  };

export const showNotification = (
  title,
  body
) => {
    if (
      Notification.permission ===
      "granted"
    ) {
      new Notification(title, {
        body,
      });
    }
  };