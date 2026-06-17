import { NavLink, useNavigate } from "react-router-dom";
import {
    Home,
    BarChart3,
    Activity,
    User,
    Users,
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
            icon: Users,
            label: "Friends",
            path: "/friends",
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
        <aside
            className="
        hidden
        lg:flex
        flex-col
        w-72
        h-screen
        shrink-0

        bg-white/75
        dark:bg-slate-900

        backdrop-blur-xl

        border-r
        border-slate-200
        dark:border-white/10
      "
        >
            {/* Logo */}
            <div
                className="
          px-6
          py-6
          border-b
          border-slate-200
          dark:border-white/5
        "
            >
                <div className="flex items-center gap-4">
                    <div
                        className="
                            h-12
                            w-12
                            rounded-2xl
                            bg-gradient-to-r
                            from-cyan-400
                            to-emerald-400
                            flex
                            items-center
                            justify-center
                            shadow-lg
                            "
                            >
                        <Wallet
                            size={22}
                            className="text-black"
                        />
                    </div>

                    <div>
                        <h2
                            className="
                text-xl
                font-bold
                text-slate-900
                dark:text-white
              "
                        >
                            Splitwise
                        </h2>

                        <p
                            className="
                text-xs
                text-slate-500
                dark:text-slate-400
              "
                        >
                            Expense Manager
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-5">
                {links.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `
                flex
                items-center
                gap-3
                px-4
                py-3.5
                rounded-2xl
                mb-2
                transition-all

                ${isActive
                                    ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold shadow-lg"
                                    : `
                      text-slate-700
                      dark:text-slate-300

                      hover:bg-slate-100
                      dark:hover:bg-white/5

                      hover:text-slate-900
                      dark:hover:text-white
                    `
                                }
              `
                            }
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>

            {/* User Card */}
            <div
                className="
          p-5
          border-t
          border-slate-200
          dark:border-white/5
        "
            >
                <div
                    className="
            rounded-3xl

            bg-white/80
            dark:bg-white/[0.03]

            border
            border-slate-200
            dark:border-white/10

            backdrop-blur-xl
            p-4
          "
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="
                h-12
                w-12
                rounded-full
                bg-gradient-to-r
                from-cyan-400
                to-emerald-400
                text-black
                font-bold
                flex
                items-center
                justify-center
              "
                        >
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>

                        <div className="min-w-0">
                            <p
                                className="
                  font-medium
                  truncate
                  text-slate-900
                  dark:text-white
                "
                            >
                                {user?.name}
                            </p>

                            <p
                                className="
                  text-xs
                  truncate
                  text-slate-500
                  dark:text-slate-400
                "
                            >
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="
              mt-4
              w-full
              flex
              items-center
              justify-center
              gap-2

              rounded-2xl

              border
              border-red-500/20

              py-3

              text-red-400

              hover:bg-red-500/10

              transition-all
            "
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