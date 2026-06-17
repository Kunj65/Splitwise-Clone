export const requestNotificationPermission =
  async () => {
    if ("Notification" in window) {
      await Notification.requestPermission();
    }
  };

export const showNotification = (
  title,
  body
) => {
  if (
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
    });
  }
};