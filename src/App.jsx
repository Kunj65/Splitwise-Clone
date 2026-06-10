import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import GroupPage from "./pages/GroupPage";
import Summary from "./pages/Summary";
import Activity from "./pages/Activity";
import Profile from "./pages/Profile";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import RequireAuth from "./auth/RequireAuth";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<RequireAuth />}>
          <Route path="/" element={<Home />} />
          <Route path="/group/:groupId" element={<GroupPage />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;