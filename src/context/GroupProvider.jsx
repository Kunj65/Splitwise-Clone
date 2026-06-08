import GroupContext from "./GroupContext";
import useAuth from "../auth/useAuth";
import { fetchJsonWithAuth } from "../api";
import { useState, useEffect, useContext } from "react";
import ActivityContext from "./ActivityContext";

export const GroupProvider = ({ children }) => {
  const { user } = useAuth();
  const activityCtx = useContext(ActivityContext);

  const [groups, setGroups] = useState([]);
  const [expensesByGroup, setExpensesByGroup] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadGroups();
    } else {
      setGroups([]);
      setExpensesByGroup({});
    }
  }, [user]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await fetchJsonWithAuth("/api/groups");
      const groupsWithIds = (response.groups || []).map((g) => ({ ...g, id: g._id }));
      setGroups(groupsWithIds);

      const expensesMap = (response.expenses || []).reduce((acc, expense) => {
        const groupId = expense.group.toString();
        acc[groupId] = [...(acc[groupId] || []), expense];
        return acc;
      }, {});
      setExpensesByGroup(expensesMap);
    } catch (error) {
      console.error("Failed to load groups:", error);
      setGroups([]);
      setExpensesByGroup({});
    } finally {
      setLoading(false);
    }
  };

  const addGroup = async (groupData) => {
    try {
      const response = await fetchJsonWithAuth("/api/groups", {
        method: "POST",
        body: groupData,
      });

      const newGroup = { ...response.group, id: response.group._id };
      setGroups((prev) => [...prev, newGroup]);

      activityCtx?.addActivity({
        type: "group_created",
        message: `Created group "${newGroup.name}"`,
      });

      return newGroup;
    } catch (error) {
      console.error("Failed to create group:", error);
      throw error;
    }
  };

  const updateGroup = async (groupId, updates) => {
    try {
      await fetchJsonWithAuth(`/api/groups/${groupId}`, {
        method: "PATCH",
        body: updates,
      });
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId || g._id === groupId ? { ...g, ...updates } : g
        )
      );
    } catch (error) {
      console.error("Failed to update group:", error);
      throw error;
    }
  };

  const archiveGroup = (groupId) => updateGroup(groupId, { archived: true });
  const restoreGroup = (groupId) => updateGroup(groupId, { archived: false });
  const settleGroup  = (groupId) => updateGroup(groupId, { settled: true });

  const addExpense = async (groupId, expenseData) => {
    try {
      const response = await fetchJsonWithAuth(`/api/groups/${groupId}/expenses`, {
        method: "POST",
        body: expenseData,
      });

      setExpensesByGroup((prev) => ({
        ...prev,
        [groupId]: [...(prev[groupId] || []), response.expense],
      }));

      const group = groups.find((g) => g.id === groupId || g._id === groupId);
      activityCtx?.addActivity({
        type: "expense_added",
        message: `Added expense "${expenseData.description}" in "${group?.name || "a group"}"`,
        amount: expenseData.amount,           // ✅ FIX: pass amount as structured field
        currency: expenseData.currency || "INR", // ✅ FIX: pass currency as structured field
      });

      return response.expense;
    } catch (error) {
      console.error("Failed to add expense:", error);
      throw error;
    }
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        expensesByGroup,
        addGroup,
        updateGroup,
        archiveGroup,
        restoreGroup,
        settleGroup,
        addExpense,
        loading,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};