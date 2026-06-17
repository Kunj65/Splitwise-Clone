import useActivity from "../context/useActivity";
import { currencySymbols } from "../utils/currencySymbols";

const getActivityIcon = (type) => {
  switch (type) {
    case "expense_added":
      return "💸";

    case "group_created":
      return "👥";

    case "group_deleted":
      return "🗑️";

    case "group_invite":
      return "📩";

    default:
      return "⚡";
  }
};

const ActivityFeed = () => {
  const { activities, clearActivities } =
    useActivity();

  return (
    <div
      className="
        glass
        rounded-[32px]
        p-8
        border
        border-white/10
      "
    >
      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <div>
          <h2 className="text-2xl font-bold">
            Recent Activity
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            Live history of everything happening
            in your account
          </p>
        </div>

        {activities.length > 0 && (
          <button
            onClick={clearActivities}
            className="
              px-4
              py-2
              rounded-xl
              border
              border-red-500/20
              text-red-400
              hover:bg-red-500/10
              transition-all
            "
          >
            Clear
          </button>
        )}

      </div>

      {/* Empty State */}

      {activities.length === 0 ? (
        <div className="text-center py-20">

          <div className="text-6xl mb-4">
            📭
          </div>

          <h3 className="text-xl font-semibold">
            No Activity Yet
          </h3>

          <p className="text-slate-400 mt-2">
            Activities will appear here once you start
            using groups and expenses.
          </p>

        </div>
      ) : (
        <div className="relative">

          {/* Timeline Line */}

          <div
            className="
              absolute
              left-6
              top-0
              bottom-0
              w-px
              bg-white/10
            "
          />

          <div className="space-y-6">

            {activities.map((a, index) => (

              <div
                key={
                  a._id ||
                  a.id ||
                  `${a.createdAt}-${index}`
                }
                className="relative pl-16"
              >

                {/* Timeline Dot */}

                <div
                  className="
                    absolute
                    left-0
                    top-0
                    h-12
                    w-12
                    rounded-full
                    bg-gradient-to-r
                    from-cyan-400
                    to-emerald-400
                    flex
                    items-center
                    justify-center
                    text-xl
                    shadow-lg
                  "
                >
                  {getActivityIcon(a.type)}
                </div>

                {/* Card */}

                <div
                  className="
                    rounded-3xl
                    bg-white/[0.03]
                    border
                    border-white/5
                    p-5
                    hover:border-cyan-400/20
                    transition-all
                  "
                >

                  <p className="font-medium">
                    {a.message}
                  </p>

                  {a.amount && (
                    <div
                      className="
                        inline-flex
                        items-center
                        mt-3
                        px-3
                        py-1
                        rounded-xl
                        bg-cyan-400/10
                        text-cyan-400
                        text-sm
                        font-medium
                      "
                    >
                      {currencySymbols[
                        a.currency || "INR"
                      ]}
                      {a.amount}
                    </div>
                  )}

                  <p className="text-xs text-slate-500 mt-3">
                    {new Date(
                      a.createdAt
                    ).toLocaleString()}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>
      )}
    </div>
  );
};

export default ActivityFeed;