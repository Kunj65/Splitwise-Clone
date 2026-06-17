import { useEffect, useState } from "react";
import { fetchJsonWithAuth } from "../api";
import useGroups from "../context/useGroups";
import AnimatedPage from "../components/AnimatedPage";


const Friends = () => {
  const { friendSearch } = useGroups();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoadingFriends(true);

      const data = await fetchJsonWithAuth("/api/friends");

      setFriends(data.friends || []);
    } catch (err) {
      console.error("Failed to load friends", err);
    } finally {
      setLoadingFriends(false);
    }

  };

  const handleSearch = async (value) => {
    setQuery(value);


    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);

    try {
      const data = await fetchJsonWithAuth(
        `/api/users/search?q=${encodeURIComponent(value)}`
      );

      const filtered =
        (data.users || []).filter(
          (user) =>
            !friends.some(
              (friend) => friend._id === user._id
            )
        );

      setResults(filtered);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setSearching(false);
    }

  };

  const addFriend = async (user) => {
    try {
      await fetchJsonWithAuth(`/api/friends/${user._id}`, {
        method: "POST",
      });

      await loadFriends();

      setResults([]);
      setQuery("");
    } catch (err) {
      alert(err.message || "Failed to add friend");
    }
  };

  const filteredFriends = friends.filter(
  (friend) =>
    friend.name
      .toLowerCase()
      .includes(friendSearch.toLowerCase()) ||
    friend.email
      .toLowerCase()
      .includes(friendSearch.toLowerCase())
);

  const removeFriend = async (friendId) => {
    try {
      await fetchJsonWithAuth(`/api/friends/${friendId}`, {
        method: "DELETE",
      });

      setFriends((prev) =>
        prev.filter((friend) => friend._id !== friendId)
      );
    } catch (err) {
      alert(err.message || "Failed to remove friend");
    }
  };

  return (
    <AnimatedPage>
        <div className="space-y-8">

    <div>
      <h1 className="text-4xl font-bold">
        Friends
      </h1>

      <p className="text-slate-400 mt-2">
        Manage your friends and future shared expenses
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-4">

      <div className="glass rounded-[32px] border border-white/10 p-6">
        <p className="text-slate-500 text-sm">
          Total Friends
        </p>

        <h3 className="text-3xl font-bold mt-2">
          {friends.length}
        </h3>
      </div>

      <div className="glass rounded-[32px] border border-white/10 p-6">
        <p className="text-slate-500 text-sm">
          Search Results
        </p>

        <h3 className="text-3xl font-bold mt-2">
          {results.length}
        </h3>
      </div>

      <div className="glass rounded-[32px] border border-white/10 p-6">
        <p className="text-slate-500 text-sm">
          Status
        </p>

        <h3 className="text-emerald-400 text-xl font-bold mt-3">
          Connected
        </h3>
      </div>

    </div>

    <div className="glass rounded-[32px] border border-white/10 p-6">

      <div className="mb-5">
        <h2 className="text-2xl font-bold">
          Add Friends
        </h2>

        <p className="text-slate-400 text-sm mt-1">
          Search registered users
        </p>
      </div>

      <div className="relative">

        <input
          value={query}
          onChange={(e) =>
            handleSearch(e.target.value)
          }
          placeholder="Search by name or email..."
          className="
          w-full
          h-12
          rounded-2xl
          bg-white/[0.04]
          border
          border-white/10
          px-4
          outline-none
          focus:border-cyan-400
        "
        />

        {searching && (
          <p className="text-sm text-slate-400 mt-3">
            Searching...
          </p>
        )}

        {results.length > 0 && (
          <div
            className="
              mt-3
              rounded-3xl
              border
              border-white/10
              bg-slate-950
              overflow-hidden
            "
          >
            {results.map((user) => (
              <button
                key={user._id}
                onClick={() => addFriend(user)}
                className="
                w-full
                flex
                items-center
                gap-4
                px-5
                py-4
                hover:bg-white/[0.04]
                transition-all
                text-left
              "
              >
                <div
                  className="
                  h-10
                  w-10
                  rounded-full
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
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>

                <div>
                  <p className="font-medium">
                    {user.name}
                  </p>

                  <p className="text-xs text-slate-400">
                    {user.email}
                  </p>
                </div>

                <span className="ml-auto text-emerald-400">
                  + Add
                </span>
              </button>
            ))}
          </div>
        )}

      </div>

    </div>

    <div className="glass rounded-[32px] border border-white/10 p-6">

      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Your Friends
        </h2>

        <p className="text-slate-400 text-sm mt-1">
          Stored in database
        </p>
      </div>

      {loadingFriends ? (
        <div className="text-center py-12">
          Loading...
        </div>
      ) : filteredFriends.length === 0 ? (
        <div className="text-center py-16">

          <div className="text-6xl mb-4">
            👥
          </div>

          <h3 className="text-xl font-semibold">
            No Friends Yet
          </h3>

          <p className="text-slate-500 mt-2">
            Add your first friend above
          </p>

        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">

          {filteredFriends.map((friend) => (
            <div
              key={friend._id}
              className="
              rounded-3xl
              bg-white/[0.03]
              border
              border-white/5
              p-5
              hover:border-cyan-400/20
              transition-all
            "
            >
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div
                    className="
                    h-12
                    w-12
                    rounded-full
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
                    {friend.name?.charAt(0)?.toUpperCase()}
                  </div>

                  <div>
                    <p className="font-semibold">
                      {friend.name}
                    </p>

                    <p className="text-sm text-slate-400">
                      {friend.email}
                    </p>
                  </div>

                </div>

                <button
                  onClick={() =>
                    removeFriend(friend._id)
                  }
                  className="
                  px-4
                  py-2
                  rounded-xl
                  border
                  border-red-500/20
                  text-red-400
                  hover:bg-red-500/10
                  transition
                "
                >
                  Remove
                </button>

              </div>
            </div>
          ))}

        </div>
      )}

    </div>

  </div>
    </AnimatedPage>

  );
};

export default Friends;
