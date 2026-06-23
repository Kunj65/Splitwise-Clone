import useActivity from "../context/useActivity";
import { useState, useMemo } from "react";
import { currencySymbols } from "../utils/currencySymbols";
import { Search, X, Filter, ChevronDown } from "lucide-react";

// ✅ Category mapping
const CATEGORY_ICONS = {
  food: "🍔",
  travel: "✈️",
  rent: "🏠",
  utilities: "💡",
  entertainment: "🎬",
  shopping: "🛍️",
  health: "💊",
  education: "📚",
  transportation: "🚗",
  insurance: "🛡️",
  other: "📦",
};

const CATEGORY_COLORS = {
  food: "#10b981",
  travel: "#3b82f6",
  rent: "#f59e0b",
  utilities: "#8b5cf6",
  entertainment: "#ec4899",
  shopping: "#f97316",
  health: "#14b8a6",
  education: "#06b6d4",
  transportation: "#8b5cf6",
  insurance: "#d946ef",
  other: "#6b7280",
};

const CATEGORY_LABELS = {
  food: "Food",
  travel: "Travel",
  rent: "Rent",
  utilities: "Utilities",
  entertainment: "Entertainment",
  shopping: "Shopping",
  health: "Health",
  education: "Education",
  transportation: "Transportation",
  insurance: "Insurance",
  other: "Other",
};

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

const getCategoryInfo = (category) => {
  const key = category?.toLowerCase() || "other";
  return {
    icon: CATEGORY_ICONS[key] || "📦",
    color: CATEGORY_COLORS[key] || "#6b7280",
    label: CATEGORY_LABELS[key] || "Other",
  };
};

const ActivityFeed = () => {
  const { activities, clearActivities } = useActivity();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const ITEMS_PER_PAGE = 10;

  // ✅ Filter activities by search query and category
  const filteredActivities = useMemo(() => {
    let result = activities;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((activity) => {
        const message = (activity.message || "").toLowerCase();
        const category = (activity.category || "").toLowerCase();
        const amount = activity.amount?.toString() || "";
        const type = (activity.type || "").toLowerCase();
        
        return (
          message.includes(query) ||
          category.includes(query) ||
          amount.includes(query) ||
          type.includes(query)
        );
      });
    }

    // Filter by category
    if (filterCategory !== "all") {
      result = result.filter(
        (activity) => activity.category?.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    return result;
  }, [activities, searchQuery, filterCategory]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const currentActivities = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredActivities.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredActivities, safeCurrentPage]);

  // Reset to page 1 when filters change
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category) => {
    setFilterCategory(category);
    setCurrentPage(1);
    setShowCategoryDropdown(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterCategory("all");
    setCurrentPage(1);
  };

  // Get category counts for filter
  const getCategoryCount = (category) => {
    if (category === "all") return activities.length;
    return activities.filter(a => a.category?.toLowerCase() === category.toLowerCase()).length;
  };

  const allCategories = [
    { value: "all", label: "All Categories" },
    { value: "food", label: "🍔 Food" },
    { value: "travel", label: "✈️ Travel" },
    { value: "rent", label: "🏠 Rent" },
    { value: "utilities", label: "💡 Utilities" },
    { value: "entertainment", label: "🎬 Entertainment" },
    { value: "shopping", label: "🛍️ Shopping" },
    { value: "health", label: "💊 Health" },
    { value: "education", label: "📚 Education" },
    { value: "transportation", label: "🚗 Transportation" },
    { value: "insurance", label: "🛡️ Insurance" },
    { value: "other", label: "📦 Other" },
  ];

  const getSelectedCategoryLabel = () => {
    const cat = allCategories.find(c => c.value === filterCategory);
    return cat?.label || "All Categories";
  };

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Recent Activity</h2>
          <p className="text-slate-400 text-sm mt-1">
            {filteredActivities.length} activity items found
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
              text-sm
            "
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by description, category, amount, or type..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="
              w-full
              pl-11
              pr-10
              py-3
              rounded-2xl
              bg-white/[0.03]
              border
              border-white/10
              text-white
              placeholder:text-slate-500
              focus:border-cyan-400/50
              focus:outline-none
              transition
            "
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="
              flex
              items-center
              gap-2
              px-4
              py-3
              rounded-2xl
              bg-white/[0.03]
              border
              border-white/10
              text-white
              hover:bg-white/[0.06]
              transition
              min-w-[160px]
              justify-between
            "
          >
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm truncate">{getSelectedCategoryLabel()}</span>
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showCategoryDropdown && (
            <div
              className="
                absolute
                right-0
                top-full
                mt-2
                w-64
                max-h-80
                overflow-y-auto
                rounded-2xl
                bg-slate-900
                border
                border-slate-800
                shadow-2xl
                z-50
                py-2
              "
            >
              {allCategories.map((cat) => {
                const count = getCategoryCount(cat.value);
                const isActive = filterCategory === cat.value;
                
                return (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryFilter(cat.value)}
                    className={`
                      w-full
                      flex
                      items-center
                      justify-between
                      px-4
                      py-2.5
                      text-sm
                      transition
                      hover:bg-white/[0.05]
                      ${isActive ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-300'}
                    `}
                  >
                    <span>{cat.label}</span>
                    <span className={`
                      text-xs
                      px-2
                      py-0.5
                      rounded-full
                      ${isActive ? 'bg-cyan-400/20 text-cyan-400' : 'bg-white/5 text-slate-500'}
                    `}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        {(searchQuery || filterCategory !== "all") && (
          <button
            onClick={clearFilters}
            className="
              px-4
              py-3
              rounded-2xl
              border
              border-white/10
              text-slate-400
              hover:bg-white/5
              hover:text-white
              transition
              text-sm
              whitespace-nowrap
            "
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {(searchQuery || filterCategory !== "all") && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filterCategory !== "all" && (
            <span
              className="
                inline-flex
                items-center
                gap-2
                px-3
                py-1.5
                rounded-full
                text-xs
                font-medium
                bg-cyan-400/10
                text-cyan-400
                border
                border-cyan-400/20
              "
            >
              {getCategoryInfo(filterCategory).icon} {getCategoryInfo(filterCategory).label}
              <button
                onClick={() => handleCategoryFilter("all")}
                className="hover:text-white transition"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span
              className="
                inline-flex
                items-center
                gap-2
                px-3
                py-1.5
                rounded-full
                text-xs
                font-medium
                bg-white/5
                text-slate-300
                border
                border-white/10
              "
            >
              🔍 "{searchQuery}"
              <button
                onClick={() => handleSearch("")}
                className="hover:text-white transition"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">
            {searchQuery || filterCategory !== "all" ? "🔍" : "📭"}
          </div>
          <h3 className="text-xl font-semibold">
            {searchQuery || filterCategory !== "all" 
              ? "No matching activities found"
              : "No Activity Yet"
            }
          </h3>
          <p className="text-slate-400 mt-2 max-w-md mx-auto">
            {searchQuery || filterCategory !== "all"
              ? `Try adjusting your search or filters${
                  filterCategory !== "all" ? ` for category "${getCategoryInfo(filterCategory).label}"` : ""
                }`
              : "Activities will appear here once you start using groups and expenses."
            }
          </p>
          {(searchQuery || filterCategory !== "all") && (
            <button
              onClick={clearFilters}
              className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm transition"
            >
              Clear all filters
            </button>
          )}
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
            {currentActivities.map((a, index) => {
              const categoryInfo = a.category ? getCategoryInfo(a.category) : null;
              
              return (
                <div
                  key={a._id || a.id || `${a.createdAt}-${index}`}
                  className="relative pl-16 animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Timeline Dot */}
                  <div
                    className={`
                      absolute
                      left-0
                      top-0
                      h-12
                      w-12
                      rounded-full
                      flex
                      items-center
                      justify-center
                      text-xl
                      shadow-lg
                      ${a.type === "expense_added" 
                        ? "bg-gradient-to-r from-cyan-400 to-emerald-400" 
                        : a.type === "group_created"
                        ? "bg-gradient-to-r from-blue-400 to-purple-400"
                        : a.type === "group_deleted"
                        ? "bg-gradient-to-r from-red-400 to-pink-400"
                        : "bg-gradient-to-r from-yellow-400 to-orange-400"
                      }
                    `}
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
                      hover:bg-white/[0.05]
                    "
                  >
                    <p className="font-medium">{a.message}</p>

                    {/* Category Badge */}
                    {categoryInfo && (
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            px-2.5
                            py-1
                            rounded-full
                            text-xs
                            font-medium
                          "
                          style={{ 
                            background: `${categoryInfo.color}20`, 
                            color: categoryInfo.color 
                          }}
                        >
                          {categoryInfo.icon} {categoryInfo.label}
                        </span>
                      </div>
                    )}

                    {/* Amount Badge */}
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
                        {currencySymbols[a.currency || "INR"]}
                        {Number(a.amount).toFixed(2)}
                      </div>
                    )}

                    <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                      <span>{new Date(a.createdAt).toLocaleString()}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                      <span className="capitalize">{a.type?.replace(/_/g, ' ')}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-white/5">
              <p className="text-xs text-slate-400">
                Showing {Math.min(filteredActivities.length, (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1)} -{' '}
                {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredActivities.length)} of {filteredActivities.length}
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={safeCurrentPage === 1}
                  className="
                    px-4
                    py-2
                    rounded-xl
                    border
                    border-white/10
                    disabled:opacity-40
                    hover:bg-white/5
                    transition-all
                    text-sm
                    disabled:cursor-not-allowed
                  "
                >
                  Previous
                </button>

                <span className="text-sm text-slate-400 px-3">
                  Page {safeCurrentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={safeCurrentPage === totalPages}
                  className="
                    px-4
                    py-2
                    rounded-xl
                    border
                    border-white/10
                    disabled:opacity-40
                    hover:bg-white/5
                    transition-all
                    text-sm
                    disabled:cursor-not-allowed
                  "
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;