import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import EditGroupModal from "../components/EditGroupModal";
import ExpenseForm from "../components/ExpenseForm";
import BalanceList from "../components/BalanceList";
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

  const group = groups.find((g) => g.id === groupId);
  const expenses = expensesByGroup[groupId] || [];

  const [editing, setEditing] = useState(false);

  if (!group) {
    return <div className="text-center mt-20 text-red-400">Group not found</div>;
  }

const handleAddExpense = async (expense) => {
  if (group.settled) return;
  try {
    await addExpense(groupId, {
      description: expense.description || "",
      amount: expense.amount,
      currency: expense.currency || "INR", // ✅ must be here
      paidBy: expense.paidBy,
      splitBetween: expense.splitBetween,
    });
  } catch (error) {
    console.error("Failed to add expense:", error);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#020617] text-white py-8">
      <div className="max-w-3xl mx-auto px-4 space-y-8">

        {/* HEADER */}
        <div className="glass p-6 rounded-3xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{group.name}</h2>
            <p className="text-gray-400">{group.members.join(" · ")}</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setEditing(true)} className="text-cyan-400">Edit</button>
            <button
              onClick={() => { archiveGroup(group.id); navigate("/"); }}
              className="text-yellow-400"
            >
              Archive
            </button>
            {!group.settled && (
              <button onClick={() => settleGroup(group.id)} className="text-emerald-400">
                Settle
              </button>
            )}
          </div>
        </div>

        {/* EXPENSE FORM */}
        {!group.settled ? (
          <ExpenseForm members={group.members} onAddExpense={handleAddExpense} />
        ) : (
          <div className="text-emerald-400 text-center">
            This group is settled. No more expenses allowed.
          </div>
        )}

        {/* BALANCES */}
        <BalanceList expenses={expenses} members={group.members} />
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