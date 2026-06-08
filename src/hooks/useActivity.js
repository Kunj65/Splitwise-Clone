import useLocalStorage from "./useLocalStorage";

const useActivity = () => {
  const [activities, setActivities] = useLocalStorage(
    "activities",
    []
  );

  const addActivity = (activity) => {
    setActivities((prev) => [
      {
        ...activity,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  return { activities, addActivity };
};

export default useActivity;
