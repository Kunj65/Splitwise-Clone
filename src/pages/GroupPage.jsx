import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import EditGroupModal from "../components/EditGroupModal";
import ExpenseForm from "../components/ExpenseForm";
import BalanceList from "../components/BalanceList";
import SettleUp from "../components/SettleUp";
import GroupChat from "../components/GroupChat";
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

  const group = groups.find((g) => g.id === groupId || g._id === groupId);
  const expenses = expensesByGroup[groupId] || [];
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("expenses");

  if (!group) {
    return <div className="text-center mt-20 text-red-400">Group not found</div>;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#020617] text-white py-8">
      <div className="max-w-3xl mx-auto px-4 space-y-6">

        {/* HEADER */}
        <div className="glass p-6 rounded-3xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{group.name}</h2>
            <p className="text-gray-400 text-sm">
              {(group.members || [])
                .map((m) => (typeof m === "object" ? m.name : m))
                .join(" · ")}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setEditing(true)} className="text-cyan-400 text-sm">Edit</button>
            <button
              onClick={() => { archiveGroup(group.id); navigate("/"); }}
              className="text-yellow-400 text-sm"
            >
              Archive
            </button>
            {!group.settled && (
              <button onClick={() => settleGroup(group.id)} className="text-emerald-400 text-sm">
                Settle
              </button>
            )}
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 overflow-x-auto">
          {["expenses", "settle", "chat"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition whitespace-nowrap ${
                activeTab === tab
                  ? "bg-emerald-400 text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {tab === "settle" ? "Settle Up" : tab === "chat" ? "Group Chat" : "Expenses"}
            </button>
          ))}
        </div>

        {/* EXPENSES TAB */}
        {activeTab === "expenses" && (
          <>
            {!group.settled ? (
              <ExpenseForm members={group.members} onAddExpense={handleAddExpense} groupId={groupId} />
            ) : (
              <div className="text-emerald-400 text-center glass rounded-3xl p-6">
                This group is settled. No more expenses allowed.
              </div>
            )}
            <BalanceList expenses={expenses} members={group.members} />
          </>
        )}

        {/* SETTLE UP TAB */}
        {activeTab === "settle" && (
          <SettleUp group={group} expenses={expenses} />
        )}

        {/* CHAT TAB */}
        {activeTab === "chat" && (
          <GroupChat groupId={groupId} />
        )}

      </div>

      {editing && (
        <EditGroupModal
          group={group}
          onClose={() => setEditing(false)}
          onSave={(data) => { updateGroup(group.id, data); setEditing(false); }}
        />
      )}
    </div>
  );
};

export default GroupPage;