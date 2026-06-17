import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/navbar/Navbar";
import DashboardLayout from "./components/DashboardLayout";

import Home from "./pages/Home";
import GroupPage from "./pages/GroupPage";
import Summary from "./pages/Summary";
import Activity from "./pages/Activity";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";

import Login from "./auth/Login";
import LoginOTP from "./auth/LoginOTP";
import Signup from "./auth/Signup";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import RequireAuth from "./auth/RequireAuth";

import { requestNotificationPermission } from "./utils/pushNotifications";

function App() {
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/login-otp" element={<LoginOTP />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route element={<RequireAuth />}>
        <Route
          path="/"
          element={
            <DashboardLayout>
              <Home />
            </DashboardLayout>
          }
        />

        <Route
          path="/group/:groupId"
          element={
            <DashboardLayout>
              <GroupPage />
            </DashboardLayout>
          }
        />

        <Route
          path="/summary"
          element={
            <DashboardLayout>
              <Summary />
            </DashboardLayout>
          }
        />

        <Route
          path="/activity"
          element={
            <DashboardLayout>
              <Activity />
            </DashboardLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          }
        />

        <Route
          path="/friends"
          element={
            <DashboardLayout>
              <Friends />
            </DashboardLayout>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;