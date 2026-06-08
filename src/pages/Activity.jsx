import AnimatedPage from "../components/AnimatedPage";
import ActivityFeed from "../components/ActivityFeed";

const Activity = () => {
  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] text-white py-10">
        <div className="max-w-3xl mx-auto px-4 space-y-8">
          <h1 className="text-3xl font-bold text-center">
            Activity
          </h1>
          <ActivityFeed />
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Activity;
