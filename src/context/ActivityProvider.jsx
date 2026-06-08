import ActivityContext from "./ActivityContext";
import useAuth from "../auth/useAuth";
import { fetchJsonWithAuth } from "../api";
import { useState, useEffect } from "react";

export const ActivityProvider = ({ children }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load activities from backend when user changes
  useEffect(() => {
    if (user) {
      loadActivities();
    } else {
      setActivities([]);
    }
  }, [user]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await fetchJsonWithAuth("/api/activities");
      const mapped = (response.activities || []).map((a) => ({
        ...a,
        id: a._id,  // ✅ FIX: map _id to id for consistency
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
        id: response.activity._id, // Map _id to id for frontend compatibility
        createdAt: response.activity.createdAt,
      };

      setActivities((prev) => [newActivity, ...prev]);
      return newActivity;
    } catch (error) {
      console.error("Failed to add activity:", error);
      throw error;
    }
  };

  const clearActivities = async () => {
    // Note: This would need a backend endpoint to clear activities
    // For now, just clear local state
    setActivities([]);
  };

  return (
    <ActivityContext.Provider
      value={{
        activities,
        addActivity,
        clearActivities,
        loading,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};
