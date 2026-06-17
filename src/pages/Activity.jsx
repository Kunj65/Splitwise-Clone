import AnimatedPage from "../components/AnimatedPage";
import ActivityFeed from "../components/ActivityFeed";

const Activity = () => {
  return (
    <AnimatedPage>
      <div className="min-h-screen text-white">

        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">

          <div className="mb-8">

            <h1 className="text-4xl font-bold">
              Activity Timeline
            </h1>

            <p className="text-slate-400 mt-2">
              Track expenses, settlements, group activity and updates.
            </p>

          </div>

          <ActivityFeed />

        </div>

      </div>
    </AnimatedPage>
  );
};

export default Activity;