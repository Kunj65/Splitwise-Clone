import useActivity from "../context/useActivity";
import { currencySymbols } from "../utils/currencySymbols";

const ActivityFeed = () => {
  const { activities, clearActivities } = useActivity();

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Activity</h3>

        {activities.length > 0 && (
          <button
            onClick={clearActivities}
            className="text-sm text-red-400 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <p className="text-gray-400">No activity yet</p>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => (
            <div
              key={a._id || a.id}  /* ✅ FIX: was just a.id which is undefined for backend data */
              className="bg-black/30 rounded-xl p-3"
            >
              <p>{a.message}</p>

              {a.amount && (
                <p className="text-sm text-cyan-400 mt-1">
                  {currencySymbols[a.currency || "INR"]}
                  {a.amount}
                </p>
              )}

              <p className="text-xs text-gray-400 mt-1">
                {new Date(a.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;