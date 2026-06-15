import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  BarChart3,
  Activity,
  User,
  Wallet,
  LogOut,
} from "lucide-react";

import useAuth from "../auth/useAuth";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    {
      icon: Home,
      label: "Home",
      path: "/",
    },
    {
      icon: BarChart3,
      label: "Summary",
      path: "/summary",
    },
    {
      icon: Activity,
      label: "Activity",
      path: "/activity",
    },
    {
      icon: User,
      label: "Profile",
      path: "/profile",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="hidden lg:flex w-72 border-r border-white/5 bg-[#081110] flex-col">
      {/* Logo */}
      <div className="px-8 py-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 flex items-center justify-center">
            <Wallet size={22} className="text-black" />
          </div>

          <div>
            <h2 className="font-bold text-lg">Splitwise</h2>
            <p className="text-xs text-gray-400">Expense Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl mb-2 transition-all ${
                  isActive
                    ? "bg-cyan-400 text-black font-semibold"
                    : "text-gray-300 hover:bg-white/5"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User Card */}
      <div className="p-5 border-t border-white/5">
        <div className="rounded-3xl bg-white/[0.03] border border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-cyan-400 text-black font-bold flex items-center justify-center">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>

            <div className="overflow-hidden">
              <p className="font-medium truncate">{user?.name}</p>

              <p className="text-xs text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/20 py-3 text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;