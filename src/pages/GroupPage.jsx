import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import EditGroupModal from "../components/EditGroupModal";
import ExpenseForm from "../components/ExpenseForm";
import BalanceList from "../components/BalanceList";
import SettleUp from "../components/SettleUp";
import GroupChat from "../components/GroupChat";
import RecurringExpenses from "../components/RecurringExpenses";
import useGroups from "../context/useGroups";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";

// Category colors (for visual tags if present)
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

const GroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const {
    groups,
    expensesByGroup,
    addExpense,
    updateGroup,
    archiveGroup,
    settleGroup,
  } = useGroups();

  const group = groups.find(
    (g) => g.id === groupId || g._id === groupId
  );

  const expenses = expensesByGroup[groupId] || [];

  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("expenses");

  // Search & pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter expenses by search query
  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses;
    const query = searchQuery.toLowerCase().trim();
    return expenses.filter((expense) => {
      const description = (expense.description || "").toLowerCase();
      const category = (expense.category || "").toLowerCase();
      const payerName = (expense.paidBy?.name || expense.paidBy || "").toLowerCase();
      const amount = expense.amount?.toString() || "";
      return (
        description.includes(query) ||
        category.includes(query) ||
        payerName.includes(query) ||
        amount.includes(query)
      );
    });
  }, [expenses, searchQuery]);

  // Pagination
  const totalItems = filteredExpenses.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedExpenses = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExpenses, safeCurrentPage]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // reset to first page on search
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (!group) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="glass rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-bold text-red-400">Group Not Found</h2>
          <p className="text-slate-400 mt-2">
            This group may have been deleted or archived.
          </p>
        </div>
      </div>
    );
  }

  const handleAddExpense = async (expense) => {
    if (group.settled) return;
    try {
      await addExpense(groupId, {
        description: expense.description || "",
        amount: expense.amount,
        paidById: expense.paidById,
        splitBetweenIds: expense.splitBetweenIds,
      });
    } catch (error) {
      console.error("Failed to add expense:", error);
    }
  };

  const totalExpenseAmount = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="glass rounded-[32px] p-8 border border-white/10">
        <div className="flex flex-col xl:flex-row xl:justify-between gap-8">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h1 className="text-4xl font-bold">{group.name}</h1>
              <span
                className={`
                  px-3 py-1 rounded-full text-xs font-semibold
                  ${
                    group.settled
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "bg-cyan-400/10 text-cyan-400"
                  }
                `}
              >
                {group.settled ? "Settled" : "Active"}
              </span>
            </div>
            <p className="text-slate-400 mb-6">Shared expense workspace</p>
            <div className="flex -space-x-3">
              {(group.members || []).slice(0, 8).map((member, index) => {
                const name = typeof member === "object" ? member.name : member;
                return (
                  <div
                    key={index}
                    className="h-12 w-12 rounded-full border-2 border-slate-900 bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-bold flex items-center justify-center"
                  >
                    {name?.charAt(0)}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 xl:w-[420px]">
            <div className="rounded-3xl bg-white/[0.03] border border-white/5 p-5">
              <p className="text-xs text-slate-500">Expenses</p>
              <h3 className="text-2xl font-bold mt-2">{expenses.length}</h3>
            </div>
            <div className="rounded-3xl bg-white/[0.03] border border-white/5 p-5">
              <p className="text-xs text-slate-500">Members</p>
              <h3 className="text-2xl font-bold mt-2">{(group.members || []).length}</h3>
            </div>
            <div className="rounded-3xl bg-white/[0.03] border border-white/5 p-5">
              <p className="text-xs text-slate-500">Total</p>
              <h3 className="text-2xl font-bold mt-2 text-emerald-400">
                ₹{totalExpenseAmount.toFixed(0)}
              </h3>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-8">
          <button
            onClick={() => setEditing(true)}
            className="px-5 py-3 rounded-2xl bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 transition"
          >
            Edit Group
          </button>
          <button
            onClick={() => {
              archiveGroup(group.id);
              navigate("/");
            }}
            className="px-5 py-3 rounded-2xl bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 transition"
          >
            Archive
          </button>
          {!group.settled && (
            <button
              onClick={() => settleGroup(group.id)}
              className="px-5 py-3 rounded-2xl bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition"
            >
              Settle Group
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {[
          { key: "expenses", label: "Expenses" },
          { key: "settle", label: "Settle Up" },
          { key: "chat", label: "Group Chat" },
          { key: "recurring", label: "Recurring" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              px-5 py-3 rounded-2xl whitespace-nowrap transition-all
              ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold"
                  : "bg-white/[0.03] border border-white/10 text-slate-300"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Expenses Tab with Search & Pagination */}
      {activeTab === "expenses" && (
        <div className="grid xl:grid-cols-[420px_1fr] gap-6">
          {/* Left: Expense Form */}
          <div>
            {!group.settled ? (
              <ExpenseForm
                members={group.members}
                onAddExpense={handleAddExpense}
                groupId={groupId}
              />
            ) : (
              <div className="glass rounded-3xl p-6 text-center">
                <p className="text-emerald-400 font-medium">This group is settled.</p>
                <p className="text-slate-400 text-sm mt-2">New expenses cannot be added.</p>
              </div>
            )}
          </div>

          {/* Right: Expense List with Search & Pagination */}
          <div className="glass rounded-[32px] p-6 border border-white/10">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search expenses by description, category, payer, or amount..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Expenses List */}
            {paginatedExpenses.length === 0 ? (
              <div className="text-center py-12">
                {searchQuery ? (
                  <>
                    <p className="text-slate-400">No expenses match your search.</p>
                    <button
                      onClick={clearSearch}
                      className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm transition"
                    >
                      Clear search
                    </button>
                  </>
                ) : (
                  <p className="text-slate-400">No expenses yet. Add your first expense!</p>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paginatedExpenses.map((expense) => {
                    const category = expense.category || "other";
                    const color = CATEGORY_COLORS[category] || "#6b7280";
                    const payerName = expense.paidBy?.name || expense.paidBy || "Unknown";
                    return (
                      <div
                        key={expense._id}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-3 hover:bg-white/[0.05] transition group"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                            style={{ background: `${color}20` }}
                          >
                            {category === "food" && "🍔"}
                            {category === "travel" && "✈️"}
                            {category === "rent" && "🏠"}
                            {category === "utilities" && "💡"}
                            {category === "entertainment" && "🎬"}
                            {category === "shopping" && "🛍️"}
                            {category === "health" && "💊"}
                            {category === "education" && "📚"}
                            {category === "transportation" && "🚗"}
                            {category === "insurance" && "🛡️"}
                            {!["food","travel","rent","utilities","entertainment","shopping","health","education","transportation","insurance"].includes(category) && "📦"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{expense.description || "Untitled"}</p>
                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                              <span className="text-xs text-slate-400">Paid by {payerName}</span>
                              <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: `${color}20`, color }}
                              >
                                {category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="font-semibold text-emerald-400">
                            ₹{Number(expense.amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(expense.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {filteredExpenses.length > itemsPerPage && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                    <p className="text-xs text-slate-400">
                      Showing {Math.min(filteredExpenses.length, (safeCurrentPage - 1) * itemsPerPage + 1)} -{' '}
                      {Math.min(safeCurrentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => goToPage(safeCurrentPage - 1)}
                        disabled={safeCurrentPage === 1}
                        className={`
                          p-2 rounded-xl border transition
                          ${safeCurrentPage === 1
                            ? "border-white/5 text-slate-500 cursor-not-allowed"
                            : "border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
                          }
                        `}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Page numbers (smart pagination) */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (safeCurrentPage <= 3) {
                            pageNum = i + 1;
                          } else if (safeCurrentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = safeCurrentPage - 2 + i;
                          }
                          // Avoid duplicate pages
                          if (i > 0 && pageNum === safeCurrentPage - 2 + i - 1) return null;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`
                                w-8 h-8 rounded-xl text-sm transition
                                ${safeCurrentPage === pageNum
                                  ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold"
                                  : "text-slate-400 hover:text-white hover:bg-white/5"
                                }
                              `}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => goToPage(safeCurrentPage + 1)}
                        disabled={safeCurrentPage === totalPages}
                        className={`
                          p-2 rounded-xl border transition
                          ${safeCurrentPage === totalPages
                            ? "border-white/5 text-slate-500 cursor-not-allowed"
                            : "border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
                          }
                        `}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Other tabs (unchanged) */}
      {activeTab === "settle" && (
        <SettleUp group={group} expenses={expenses} />
      )}
      {activeTab === "chat" && <GroupChat groupId={groupId} />}
      {activeTab === "recurring" && <RecurringExpenses groupId={groupId} />}

      {editing && (
        <EditGroupModal
          group={group}
          onClose={() => setEditing(false)}
          onSave={(data) => {
            updateGroup(group.id, data);
            setEditing(false);
          }}
        />
      )}
    </div>
  );
};

export default GroupPage;