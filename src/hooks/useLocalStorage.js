import { useEffect, useState } from "react";

const readValue = (key, initialValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  } catch (error) {
    console.error("LocalStorage read error:", error);
    return initialValue;
  }
};

const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => readValue(key, initialValue));

  useEffect(() => {
    setValue(readValue(key, initialValue));
  }, [key, initialValue]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("LocalStorage write error:", error);
    }
  }, [key, value]);

  return [value, setValue];
};

export default useLocalStorage;
