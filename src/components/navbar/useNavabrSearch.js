import { useMemo, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import useGroups from "../../context/useGroups";
import ActivityContext from "../../context/ActivityContext";

const useNavbarSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    groups = [],
    friends = [],
    setFriendSearch,
  } = useGroups();

  const activityCtx = useContext(ActivityContext);
  const activities = activityCtx?.activities || [];

  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const currentPage = useMemo(() => {
    if (location.pathname.startsWith("/friends")) {
      return "friends";
    }

    if (location.pathname.startsWith("/activity")) {
      return "activity";
    }

    if (location.pathname.startsWith("/summary")) {
      return "summary";
    }

    return "groups";
  }, [location.pathname]);

  const placeholder = useMemo(() => {
    switch (currentPage) {
      case "friends":
        return "Search friends...";

      case "activity":
        return "Search activities...";

      case "summary":
        return "Search expenses...";

      default:
        return "Search groups...";
    }
  }, [currentPage]);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];

    const search = query.toLowerCase();

    switch (currentPage) {
      case "groups":
        return groups
          .filter((group) =>
            group.name?.toLowerCase().includes(search)
          )
          .slice(0, 6);

      case "friends":
        return friends
          .filter(
            (friend) =>
              friend.name
                ?.toLowerCase()
                .includes(search) ||
              friend.email
                ?.toLowerCase()
                .includes(search)
          )
          .slice(0, 6);

      case "activity":
        return activities
          .filter((activity) =>
            activity.message
              ?.toLowerCase()
              .includes(search)
          )
          .slice(0, 6);

      case "summary":
        return [];

      default:
        return [];
    }
  }, [
    query,
    currentPage,
    groups,
    friends,
    activities,
  ]);

  const handleSearch = () => {
    if (!query.trim()) return;

    if (currentPage === "groups") {
      if (suggestions.length > 0) {
        navigate(
          `/group/${
            suggestions[0]._id ||
            suggestions[0].id
          }`
        );
      }
    }

    else if (currentPage === "friends") {
      setFriendSearch(query);
    }

    else if (currentPage === "activity") {
      navigate(
        `/activity?search=${encodeURIComponent(
          query
        )}`
      );
    }

    else if (currentPage === "summary") {
      navigate(
        `/summary?search=${encodeURIComponent(
          query
        )}`
      );
    }

    setShowSuggestions(false);
  };

  const handleSuggestionClick = (item) => {
    if (currentPage === "groups") {
      navigate(
        `/group/${item._id || item.id}`
      );
    }

    else if (currentPage === "friends") {
      setFriendSearch(item.name);
      setQuery(item.name);
    }

    else if (currentPage === "activity") {
      setQuery(item.message);
    }

    setShowSuggestions(false);
  };

  return {
    currentPage,
    query,
    setQuery,
    suggestions,
    placeholder,
    showSuggestions,
    setShowSuggestions,
    handleSearch,
    handleSuggestionClick,
  };
};

export default useNavbarSearch;