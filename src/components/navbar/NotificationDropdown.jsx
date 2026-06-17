import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import ActivityContext from "../../context/ActivityContext";

const BellIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);

  const activityCtx = useContext(ActivityContext);
  const activities = activityCtx?.activities || [];

  const unreadCount = Math.min(activities.length, 9);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="
          relative
          h-11
          w-11
          rounded-xl
          border
          border-white/10
          bg-white/[0.04]
          flex
          items-center
          justify-center
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

      {open && (
        <div
          className="
            absolute
            right-0
            top-14
            w-80
            rounded-3xl
            border
            border-white/10
            bg-slate-950
            overflow-hidden
            z-50
          "
        >
          <div className="p-4 border-b border-white/5">
            <h3 className="font-semibold">
              Recent Activity
            </h3>
          </div>

          {activities.length === 0 ? (
            <p className="p-4 text-slate-400">
              No activity yet
            </p>
          ) : (
            activities.slice(0, 5).map((a) => (
              <div
                key={a._id || a.id}
                className="
                  p-4
                  border-b
                  border-white/5
                "
              >
                <p className="text-sm">
                  {a.message}
                </p>
              </div>
            ))
          )}

          <Link
            to="/activity"
            className="
              block
              text-center
              py-3
              text-cyan-400
            "
          >
            View All Activity →
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;