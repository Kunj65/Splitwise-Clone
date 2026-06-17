import GroupContext from "./GroupContext";
import useAuth from "../auth/useAuth";
import { fetchJsonWithAuth } from "../api";
import { useState, useEffect, useContext } from "react";
import ActivityContext from "./ActivityContext";
import useSocket from "./useSocket";
import { sendPushNotification } from "../utils/pushNotifications";
import { showNotification } from "../utils/notificationService";

export const GroupProvider = ({ children }) => {
  const { user } = useAuth();
  const activityCtx = useContext(ActivityContext);
  const socketRef = useSocket();

  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [expensesByGroup, setExpensesByGroup] = useState({});

  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [friendSearch, setFriendSearch] = useState("");

  useEffect(() => {
    if (user) {
      loadGroups();
      loadFriends();
    } else {
      setGroups([]);
      setFriends([]);
      setExpensesByGroup({});
    }
  }, [user]);

  useEffect(() => {
    const socket = socketRef?.current;

    if (!socket) return;

    const handleGroupAdded = (group) => {
      const normalized = {
        ...group,
        id: group._id,
      };

      setGroups((prev) => {
        if (
          prev.find(
            (g) => g.id === normalized.id
          )
        ) {
          return prev;
        }

        return [...prev, normalized];
      });

      activityCtx?.addActivity({
        type: "group_invite",
        message: `You were added to group "${group.name}"`,
      });
    };

    const handleExpenseAdded = ({
      groupId,
      expense,
    }) => {
      setExpensesByGroup((prev) => ({
        ...prev,
        [groupId]: [
          ...(prev[groupId] || []),
          expense,
        ],
      }));

      activityCtx?.addActivity({
        type: "expense_added",
        message: `New expense "${expense.description}" of ₹${expense.amount} in your group`,
      });

      sendPushNotification(
        "New Expense Added",
        `${expense.paidBy?.name} added "${expense.description}" ₹${expense.amount}`
      );
    };

    socket.on(
      "group:added",
      handleGroupAdded
    );

    socket.on(
      "expense:added",
      handleExpenseAdded
    );

    return () => {
      socket.off(
        "group:added",
        handleGroupAdded
      );

      socket.off(
        "expense:added",
        handleExpenseAdded
      );
    };
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);

      const response =
        await fetchJsonWithAuth(
          "/api/groups"
        );

      const groupsWithIds = (
        response.groups || []
      ).map((group) => ({
        ...group,
        id: group._id,
      }));

      setGroups(groupsWithIds);

      const expensesMap = (
        response.expenses || []
      ).reduce((acc, expense) => {
        const groupId =
          expense.group.toString();

        acc[groupId] = [
          ...(acc[groupId] || []),
          expense,
        ];

        return acc;
      }, {});

      setExpensesByGroup(
        expensesMap
      );
    } catch (error) {
      console.error(
        "Failed to load groups:",
        error
      );

      setGroups([]);
      setExpensesByGroup({});
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      const response =
        await fetchJsonWithAuth(
          "/api/friends"
        );

      setFriends(
        response.friends || []
      );
    } catch (error) {
      console.error(
        "Failed to load friends:",
        error
      );

      setFriends([]);
    }
  };

  const addGroup = async (
    groupData
  ) => {
    try {
      const response =
        await fetchJsonWithAuth(
          "/api/groups",
          {
            method: "POST",
            body: groupData,
          }
        );

      const newGroup = {
        ...response.group,
        id: response.group._id,
      };

      setGroups((prev) => [
        ...prev,
        newGroup,
      ]);

      activityCtx?.addActivity({
        type: "group_created",
        message: `Created group "${newGroup.name}"`,
      });

      return newGroup;
    } catch (error) {
      console.error(
        "Failed to create group:",
        error
      );

      throw error;
    }
  };

  const updateGroup = async (
    groupId,
    updates
  ) => {
    try {
      await fetchJsonWithAuth(
        `/api/groups/${groupId}`,
        {
          method: "PATCH",
          body: updates,
        }
      );

      setGroups((prev) =>
        prev.map((group) =>
          group.id === groupId ||
          group._id === groupId
            ? {
                ...group,
                ...updates,
              }
            : group
        )
      );
    } catch (error) {
      console.error(
        "Failed to update group:",
        error
      );

      throw error;
    }
  };

  const archiveGroup = (groupId) =>
    updateGroup(groupId, {
      archived: true,
    });

  const restoreGroup = (groupId) =>
    updateGroup(groupId, {
      archived: false,
    });

  const settleGroup = (groupId) =>
    updateGroup(groupId, {
      settled: true,
    });

  const deleteGroup = async (
    groupId
  ) => {
    try {
      const group = groups.find(
        (g) =>
          g.id === groupId ||
          g._id === groupId
      );

      await fetchJsonWithAuth(
        `/api/groups/${groupId}`,
        {
          method: "DELETE",
        }
      );

      setGroups((prev) =>
        prev.filter(
          (g) =>
            g.id !== groupId &&
            g._id !== groupId
        )
      );

      setExpensesByGroup(
        (prev) => {
          const updated = {
            ...prev,
          };

          delete updated[groupId];

          return updated;
        }
      );

      if (activityCtx) {
        await activityCtx.addActivity({
          type: "group_deleted",
          message: `Deleted group "${group?.name || "a group"}"`,
        });
      }
    } catch (error) {
      console.error(
        "Failed to delete group:",
        error
      );

      throw error;
    }
  };

const addExpense = async (groupId, expenseData) => {
  try {
    const response = await fetchJsonWithAuth(
      `/api/groups/${groupId}/expenses`,
      {
        method: "POST",
        body: expenseData,
      }
    );

    setExpensesByGroup((prev) => ({
      ...prev,
      [groupId]: [
        ...(prev[groupId] || []),
        response.expense,
      ],
    }));

    const group = groups.find(
      (g) =>
        g.id === groupId ||
        g._id === groupId
    );

    activityCtx?.addActivity({
      type: "expense_added",
      message: `Added expense "${expenseData.description}" of ₹${expenseData.amount} in "${group?.name || "a group"}"`,
    });

    showNotification(
      "Expense Added",
      `${expenseData.description} - ₹${expenseData.amount}`
    );

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
        friends,

        expensesByGroup,
        loading,

        searchTerm,
        setSearchTerm,

        friendSearch,
        setFriendSearch,

        addGroup,
        updateGroup,
        archiveGroup,
        restoreGroup,
        settleGroup,
        deleteGroup,
        addExpense,

        loadFriends,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};