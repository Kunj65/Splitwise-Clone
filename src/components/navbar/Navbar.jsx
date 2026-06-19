  import { useState, useEffect, useContext } from "react";
  import { Link, useNavigate } from "react-router-dom";

  import useAuth from "../../auth/useAuth";
  import ActivityContext from "../../context/ActivityContext";

  import SearchBar from "./SearchBar";
  import useNavbarSearch from "./useNavabrSearch";

  const SunIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />

      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />

      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />

      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />

      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    </svg>
  );

  const MoonIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );

  const BellIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );

  const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const activityCtx = useContext(ActivityContext);
    const activities = activityCtx?.activities || [];

    const [menuOpen, setMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const [darkMode, setDarkMode] = useState(
      localStorage.getItem("theme") !== "light"
    );

    const {
      currentPage,
      query,
      setQuery,
      suggestions,
      placeholder,
      showSuggestions,
      setShowSuggestions,
      handleSearch,
      handleSuggestionClick,
    } = useNavbarSearch();

    useEffect(() => {
      const resizeHandler = () => {
        setIsMobile(window.innerWidth < 768);
      };

      window.addEventListener("resize", resizeHandler);

      return () => {
        window.removeEventListener("resize", resizeHandler);
      };
    }, []);

    useEffect(() => {
      if (darkMode) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }, [darkMode]);

    const handleLogout = () => {
      logout();
      navigate("/login", { replace: true });
    };

    const unreadCount = activityCtx?.unreadCount || 0;
    {
      unreadCount > 0 && (
        <span
          className="
        absolute
        -top-1
        -right-1
        min-w-[20px]
        h-5
        px-1
        rounded-full
        bg-red-500
        text-[10px]
        flex
        items-center
        justify-center
      "
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )
    }

    return (
      <nav
        className="
      sticky
      top-0
      z-40
      px-6
      py-4

      text-slate-900
      dark:text-white

      border-b

      border-slate-200
      dark:border-white/10

      backdrop-blur-xl

      bg-white/60
      dark:bg-black/40
    "
      >
        <div className="flex items-center justify-between">
          <SearchBar
            currentPage={currentPage}
            query={query}
            setQuery={setQuery}
            suggestions={suggestions}
            placeholder={placeholder}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            handleSearch={handleSearch}
            handleSuggestionClick={handleSuggestionClick}
          />

          <Link
            to="/"
            className="
              md:hidden
              text-2xl
              font-bold
              text-emerald-400
            "
          >
            Splitwise
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="
                h-10
                w-10
                rounded-xl
                border
                border-white/10
                bg-white/[0.04]
                flex
                items-center
                justify-center
              "
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            <div className="relative">
              <button
                onClick={() =>
                  setShowNotifications(!showNotifications)
                }
                className="
                  h-10
                  w-10
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  flex
                  items-center
                  justify-center
                  relative
                "
              >
                <BellIcon />

                {unreadCount > 0 && (
                  <span
                    className="
                      absolute
                      -top-1
                      -right-1
                      h-5
                      w-5
                      rounded-full
                      bg-red-500
                      text-[10px]
                      flex
                      items-center
                      justify-center
                    "
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className="
        absolute
        right-0
        top-14
        w-[420px]
        rounded-3xl

        z-[9999]

        bg-slate-950
        border
        border-slate-800

        overflow-hidden

        shadow-[0_20px_50px_rgba(0,0,0,0.6)]
      "
                >
                  <div className="p-4 border-b border-white/5">
                    <h3 className="font-semibold">
                      Recent Activity
                    </h3>
                  </div>

                  {activities.length === 0 ? (
                    <p className="p-4 text-sm text-slate-400">
                      No activity yet
                    </p>
                  ) : (
                    activities.slice(0, 5).map((activity) => (
                      <div
                        key={activity.id}
                        className="
                          p-4
                          border-b
                          border-white/5
                        "
                      >
                        <p className="text-sm">
                          {activity.message}
                        </p>
                      </div>
                    ))
                  )}

                  <Link
                    to="/activity"
                    onClick={() =>
                      setShowNotifications(false)
                    }
                    className="
                      block
                      py-3
                      text-center
                      text-cyan-400
                    "
                  >
                    View Activity →
                  </Link>
                </div>
              )}
            </div>

            <div
              className="
                hidden
                md:flex
                items-center
                gap-3
                border-l
                border-white/10
                pl-3
              "
            >
              <div
                className="
                  h-10
                  w-10
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
            </div>

            {isMobile && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex flex-col gap-1"
              >
                <span className="w-6 h-[2px] bg-white" />
                <span className="w-6 h-[2px] bg-white" />
                <span className="w-6 h-[2px] bg-white" />
              </button>
            )}
          </div>
        </div>

        {menuOpen && isMobile && (
          <div
            className="
              mt-4
              rounded-2xl
              border
              border-white/10
              theme-card
            "
          >
            <button
              onClick={handleLogout}
              className="
                w-full
                text-left
                px-4
                py-4
                text-red-400
              "
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    );
  };

  export default Navbar;