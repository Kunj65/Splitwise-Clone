import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useAuth from "../auth/useAuth";
import SocketContext from "./SocketContext";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io(SOCKET_URL, { withCredentials: true });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join", user.id || user._id);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
};