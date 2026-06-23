import AnimatedPage from "../components/AnimatedPage";
import ActivityFeed from "../components/ActivityFeed";

const Activity = () => {
  return (
    <AnimatedPage>
      <div className="min-h-screen text-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Activity Timeline
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 animate-pulse">
                Live
              </span>
            </div>
            
            <p className="text-slate-400 mt-2 max-w-2xl">
              Track expenses, settlements, group activity, and category-based updates in real-time.
            </p>
          </div>

          {/* Activity Feed with full functionality */}
          <ActivityFeed />

        </div>
      </div>
    </AnimatedPage>
  );
};

export default Activity;