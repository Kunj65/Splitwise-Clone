import useActivity from "../context/useActivity";
import { useState, useMemo } from "react";
import { currencySymbols } from "../utils/currencySymbols";
import { 
  ArrowRight,
  ChevronDown,
  Clock,
  CreditCard,
  DollarSign,
  Filter,
  Mail,
  MessageSquare,
  PlusCircle,
  Search,
  Tag,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
  Zap
} from "lucide-react";

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
  const iconProps = { className: "w-6 h-6" };
  
  switch (type) {
    case "expense_added":
      return <DollarSign {...iconProps} className="w-6 h-6 text-emerald-400" />;
    case "group_created":
      return <Users {...iconProps} className="w-6 h-6 text-blue-400" />;
    case "group_deleted":
      return <Trash2 {...iconProps} className="w-6 h-6 text-red-400" />;
    case "group_invite":
      return <Mail {...iconProps} className="w-6 h-6 text-purple-400" />;
    default:
      return <Zap {...iconProps} className="w-6 h-6 text-yellow-400" />;
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

  const filteredActivities = useMemo(() => {
    let result = activities;

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

    if (filterCategory !== "all") {
      result = result.filter(
        (activity) => activity.category?.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    return result;
  }, [activities, searchQuery, filterCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const currentActivities = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredActivities.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredActivities, safeCurrentPage]);

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

  const getCategoryCount = (category) => {
    if (category === "all") return activities.length;
    return activities.filter(a => {
      const activityCategory = a.category?.toLowerCase() || "other";
      return activityCategory === category.toLowerCase();
    }).length;
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

  // Format time ago
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar - Redesigned */}
      <div className="glass rounded-[32px] p-6 border border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search activities..."
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
                text-sm
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

          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="
                flex
                items-center
                gap-2
                px-5
                py-3
                rounded-2xl
                bg-white/[0.03]
                border
                border-white/10
                text-white
                hover:bg-white/[0.06]
                transition
                min-w-[180px]
                justify-between
                text-sm
              "
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="truncate">{getSelectedCategoryLabel()}</span>
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

          {/* Clear Filters */}
          {(searchQuery || filterCategory !== "all") && (
            <button
              onClick={clearFilters}
              className="
                px-5
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

        {/* Active Filters */}
        {(searchQuery || filterCategory !== "all") && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
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
      </div>

      {/* Activity Cards */}
      {currentActivities.length === 0 ? (
        <div className="glass rounded-[32px] p-16 text-center border border-white/10">
          <div className="text-6xl mb-4">
            {searchQuery || filterCategory !== "all" ? "🔍" : "📭"}
          </div>
          <h3 className="text-xl font-semibold">
            {searchQuery || filterCategory !== "all" 
              ? "No matching activities found"
              : "No Activity Yet"
            }
          </h3>
          <p className="text-slate-400 mt-2 max-w-md mx-auto text-sm">
            {searchQuery || filterCategory !== "all"
              ? `Try adjusting your search or filters`
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
        <div className="space-y-4">
          {currentActivities.map((activity, index) => {
            const categoryInfo = activity.category ? getCategoryInfo(activity.category) : null;
            const isExpense = activity.type === "expense_added";
            
            return (
              <div
                key={activity._id || activity.id || `${activity.createdAt}-${index}`}
                className="
                  group
                  glass
                  rounded-[24px]
                  p-6
                  border
                  border-white/5
                  hover:border-cyan-400/30
                  hover:bg-white/[0.04]
                  transition-all
                  duration-300
                  animate-fadeIn
                "
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-5">
                  {/* Icon Circle */}
                  <div
                    className={`
                      flex-shrink-0
                      w-14
                      h-14
                      rounded-2xl
                      flex
                      items-center
                      justify-center
                      text-2xl
                      shadow-lg
                      transition-transform
                      group-hover:scale-110
                      ${isExpense 
                        ? "bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-400/20" 
                        : "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/20"
                      }
                    `}
                  >
                    {isExpense ? "💸" : getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Message and Time */}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-medium text-white/90 text-base leading-relaxed">
                        {activity.message}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {timeAgo(activity.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Tags and Details */}
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {/* Category Badge */}
                      {categoryInfo && (
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
                            transition-all
                            hover:scale-105
                          "
                          style={{ 
                            background: `${categoryInfo.color}20`, 
                            color: categoryInfo.color,
                            border: `1px solid ${categoryInfo.color}30`
                          }}
                        >
                          {categoryInfo.icon} {categoryInfo.label}
                        </span>
                      )}

                      {/* Type Badge */}
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1
                          px-2.5
                          py-1
                          rounded-full
                          text-xs
                          font-medium
                          bg-white/5
                          text-slate-400
                          border
                          border-white/5
                        "
                      >
                        <Tag className="w-3 h-3" />
                        {activity.type?.replace(/_/g, ' ') || 'activity'}
                      </span>

                      {/* Amount Badge */}
                      {activity.amount && (
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1
                            px-3
                            py-1
                            rounded-full
                            text-xs
                            font-semibold
                            bg-emerald-400/10
                            text-emerald-400
                            border
                            border-emerald-400/20
                          "
                        >
                          {currencySymbols[activity.currency || "INR"]}
                          {Number(activity.amount).toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Full timestamp on hover */}
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-slate-600">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Arrow */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="w-5 h-5 text-slate-500" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-white/5">
              <p className="text-xs text-slate-400">
                Showing {Math.min(filteredActivities.length, (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1)} -{' '}
                {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredActivities.length)} of {filteredActivities.length}
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={safeCurrentPage === 1}
                  className="
                    px-5
                    py-2.5
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
                    px-5
                    py-2.5
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