export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const sendPushNotification = (title, body, icon = "/vite.svg") => {
  if (Notification.permission !== "granted") return;
  new Notification(title, { body, icon });
}; 