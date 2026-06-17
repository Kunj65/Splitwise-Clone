import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import EditGroupModal from "../components/EditGroupModal";
import ExpenseForm from "../components/ExpenseForm";
import BalanceList from "../components/BalanceList";
import SettleUp from "../components/SettleUp";
import GroupChat from "../components/GroupChat";
import RecurringExpenses from "../components/RecurringExpenses";
import useGroups from "../context/useGroups";

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

if (!group) {
return ( <div className="flex items-center justify-center h-full"> <div className="glass rounded-3xl p-10 text-center"> <h2 className="text-2xl font-bold text-red-400">
Group Not Found </h2>

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

return ( <div className="space-y-8 text-white">

  {/* Header */}
  <div
    className="
      glass
      rounded-[32px]
      p-8
      border
      border-white/10
    "
  >
    <div className="flex flex-col xl:flex-row xl:justify-between gap-8">

      <div className="flex-1">

        <div className="flex flex-wrap items-center gap-3 mb-4">

          <h1 className="text-4xl font-bold">
            {group.name}
          </h1>

          <span
            className={`
              px-3
              py-1
              rounded-full
              text-xs
              font-semibold
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

        <p className="text-slate-400 mb-6">
          Shared expense workspace
        </p>

        <div className="flex -space-x-3">
          {(group.members || [])
            .slice(0, 8)
            .map((member, index) => {
              const name =
                typeof member === "object"
                  ? member.name
                  : member;

              return (
                <div
                  key={index}
                  className="
                    h-12
                    w-12
                    rounded-full
                    border-2
                    border-slate-900
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
                  {name?.charAt(0)}
                </div>
              );
            })}
        </div>

      </div>

      <div className="grid grid-cols-3 gap-4 xl:w-[420px]">

        <div className="rounded-3xl bg-white/[0.03] border border-white/5 p-5">
          <p className="text-xs text-slate-500">
            Expenses
          </p>

          <h3 className="text-2xl font-bold mt-2">
            {expenses.length}
          </h3>
        </div>

        <div className="rounded-3xl bg-white/[0.03] border border-white/5 p-5">
          <p className="text-xs text-slate-500">
            Members
          </p>

          <h3 className="text-2xl font-bold mt-2">
            {(group.members || []).length}
          </h3>
        </div>

        <div className="rounded-3xl bg-white/[0.03] border border-white/5 p-5">
          <p className="text-xs text-slate-500">
            Total
          </p>

          <h3 className="text-2xl font-bold mt-2 text-emerald-400">
            ₹{totalExpenseAmount.toFixed(0)}
          </h3>
        </div>

      </div>

    </div>

    <div className="flex flex-wrap gap-3 mt-8">

      <button
        onClick={() => setEditing(true)}
        className="
          px-5
          py-3
          rounded-2xl
          bg-cyan-400/10
          text-cyan-400
          hover:bg-cyan-400/20
          transition
        "
      >
        Edit Group
      </button>

      <button
        onClick={() => {
          archiveGroup(group.id);
          navigate("/");
        }}
        className="
          px-5
          py-3
          rounded-2xl
          bg-yellow-400/10
          text-yellow-400
          hover:bg-yellow-400/20
          transition
        "
      >
        Archive
      </button>

      {!group.settled && (
        <button
          onClick={() => settleGroup(group.id)}
          className="
            px-5
            py-3
            rounded-2xl
            bg-emerald-400/10
            text-emerald-400
            hover:bg-emerald-400/20
            transition
          "
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
          px-5
          py-3
          rounded-2xl
          whitespace-nowrap
          transition-all
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

  {/* Expenses */}
  {activeTab === "expenses" && (
    <div className="grid xl:grid-cols-[420px_1fr] gap-6">

      <div>
        {!group.settled ? (
          <ExpenseForm
            members={group.members}
            onAddExpense={handleAddExpense}
            groupId={groupId}
          />
        ) : (
          <div className="glass rounded-3xl p-6 text-center">
            <p className="text-emerald-400 font-medium">
              This group is settled.
            </p>

            <p className="text-slate-400 text-sm mt-2">
              New expenses cannot be added.
            </p>
          </div>
        )}
      </div>

      <BalanceList
        expenses={expenses}
        members={group.members}
      />

    </div>
  )}

  {/* Settle Up */}
  {activeTab === "settle" && (
    <SettleUp
      group={group}
      expenses={expenses}
    />
  )}

  {/* Chat */}
  {activeTab === "chat" && (
    <GroupChat groupId={groupId} />
  )}

  {/* Recurring */}
  {activeTab === "recurring" && (
    <RecurringExpenses groupId={groupId} />
  )}

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
