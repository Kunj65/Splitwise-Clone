import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import AuthProvider from "./auth/AuthProvider";
import { ActivityProvider } from "./context/ActivityProvider";
import { SocketProvider } from "./context/SocketProvider";
import { GroupProvider } from "./context/GroupProvider";
import { pingBackend } from "./api";
pingBackend();
setInterval(pingBackend, 10 * 60 * 1000); // wake up Render immediately when app loads

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ActivityProvider>
          <SocketProvider>
            <GroupProvider>
              <App />
            </GroupProvider>
          </SocketProvider>
        </ActivityProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);