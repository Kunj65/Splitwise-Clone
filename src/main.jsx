import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

import AuthProvider from "./auth/AuthProvider";
import { ActivityProvider } from "./context/ActivityProvider";
import { SocketProvider } from "./context/SocketProvider";
import { GroupProvider } from "./context/GroupProvider";
import { SearchProvider } from "./context/SearchContext";
import { ThemeProvider } from "./context/ThemeProvider";

import ErrorBoundary from "./components/ErrorBoundary";

import { pingBackend } from "./api";

pingBackend();
setInterval(pingBackend, 10 * 60 * 1000);

ReactDOM.createRoot(document.getElementById("root")).render(
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ActivityProvider>
            <SocketProvider>
              <SearchProvider>
                <ThemeProvider>
                  <GroupProvider>
                    <App />
                  </GroupProvider>
                </ThemeProvider>
              </SearchProvider>
            </SocketProvider>
          </ActivityProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
);