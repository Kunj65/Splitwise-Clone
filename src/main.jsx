import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import AuthProvider from "./auth/AuthProvider";
import { ActivityProvider } from "./context/ActivityProvider";
import { GroupProvider } from "./context/GroupProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ActivityProvider>
          <GroupProvider>
            <App />
          </GroupProvider>
        </ActivityProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);