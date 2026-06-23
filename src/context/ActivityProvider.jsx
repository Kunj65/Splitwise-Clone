import ActivityContext from "./ActivityContext";
import useAuth from "../auth/useAuth";
import { fetchJsonWithAuth } from "../api";
import { useState, useEffect } from "react";

export const ActivityProvider = ({ children }) => {
  const { user } = useAuth();

  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadActivities();
    } else {
      setActivities([]);
      setNotifications([]);
    }
  }, [user]);

  const loadActivities = async () => {
    try {
      setLoading(true);

      const response = await fetchJsonWithAuth("/api/activities");

      const mapped = (response || []).map((activity) => ({
        ...activity,
        id: activity._id,
      }));

      setActivities(mapped);
    } catch (error) {
      console.error("Failed to load activities:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (activityData) => {
    try {
      const response = await fetchJsonWithAuth("/api/activities", {
        method: "POST",
        body: activityData,
      });

      const newActivity = {
        ...response.activity,
        id: response.activity._id,
        createdAt: response.activity.createdAt,
      };

      setActivities((prev) => [newActivity, ...prev]);

      return newActivity;
    } catch (error) {
      console.error("Failed to add activity:", error);
      throw error;
    }
  };

  const clearActivities = () => {
    setActivities([]);
  };

  const addNotification = (notificationData) => {
    const notification = {
      id: Date.now().toString(),
      ...notificationData,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [notification, ...prev]);

    return notification;
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <ActivityContext.Provider
      value={{
        activities,
        notifications,
        addActivity,
        clearActivities,
        addNotification,
        markAllNotificationsAsRead,
        clearNotifications,
        unreadCount,
        loading,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};