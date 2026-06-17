import { useState } from "react";
import { fetchJsonWithAuth } from "../api";

const CreateGroupModal = ({ onClose, onCreate }) => {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await fetchJsonWithAuth(`/api/users/search?q=${encodeURIComponent(q)}`);
      // Filter out already added members
      const filtered = data.users.filter(
        (u) => !members.find((m) => m._id === u._id)
      );
      setSearchResults(filtered);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addMember = (user) => {
    setMembers((prev) => [...prev, user]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeMember = (id) => {
    setMembers((prev) => prev.filter((m) => m._id !== id));
  };

  const handleCreate = () => {
    if (!groupName.trim()) return;
    onCreate({
      name: groupName.trim(),
      memberIds: members.map((m) => m._id),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="
        relative
        w-full
        max-w-xl
        rounded-[32px]
        border
        border-white/10
        bg-[#081110]
        shadow-[0_0_60px_rgba(34,211,238,0.08)]
        overflow-hidden
      "
      >

        {/* Header */}
        <div
          className="
          px-8
          py-6
          border-b
          border-white/5
        "
        >
          <h2 className="text-2xl font-bold text-white">
            Create New Group
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            Create a group and invite members to start tracking expenses.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">

          {/* Group Name */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Group Name
            </label>

            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Trip to Goa"
              className="
              w-full
              h-12
              rounded-2xl
              border
              border-white/10
              bg-white/[0.04]
              px-4
              text-white
              outline-none
              focus:border-cyan-400/40
            "
            />
          </div>

          {/* Search Members */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Add Members
            </label>

            <div className="relative">

              <input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="
                w-full
                h-12
                rounded-2xl
                border
                border-white/10
                bg-white/[0.04]
                px-4
                text-white
                outline-none
                focus:border-cyan-400/40
              "
              />

              {searching && (
                <p className="text-xs text-slate-500 mt-2">
                  Searching...
                </p>
              )}

              {searchResults.length > 0 && (
                <div
                  className="
                  absolute
                  top-14
                  w-full
                  rounded-2xl
                  border
                  border-white/10
                  bg-slate-950
                  overflow-hidden
                  shadow-2xl
                  z-20
                "
                >
                  {searchResults.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => addMember(u)}
                      className="
                      w-full
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
                      hover:bg-white/5
                      transition
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
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div>
                        <p className="text-white text-sm">
                          {u.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {u.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* Members */}
          {members.length > 0 && (
            <div>

              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm text-slate-400">
                  Members
                </h4>

                <span
                  className="
                  px-3
                  py-1
                  rounded-full
                  bg-cyan-400/10
                  text-cyan-400
                  text-xs
                "
                >
                  {members.length}
                </span>
              </div>

              <div className="space-y-3 max-h-56 overflow-auto">

                {members.map((m) => (
                  <div
                    key={m._id}
                    className="
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    border
                    border-white/5
                    bg-white/[0.03]
                    px-4
                    py-3
                  "
                  >
                    <div className="flex items-center gap-3">

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
                        {m.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div>
                        <p className="text-white text-sm">
                          {m.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {m.email}
                        </p>
                      </div>

                    </div>

                    <button
                      onClick={() => removeMember(m._id)}
                      className="
                      text-red-400
                      hover:text-red-300
                      text-lg
                    "
                    >
                      ×
                    </button>
                  </div>
                ))}

              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div
          className="
          px-8
          py-6
          border-t
          border-white/5
          flex
          justify-end
          gap-3
        "
        >

          <button
            onClick={onClose}
            className="
            px-5
            py-3
            rounded-2xl
            border
            border-white/10
            text-slate-300
            hover:bg-white/5
          "
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={!groupName.trim()}
            className="
            px-6
            py-3
            rounded-2xl
            bg-gradient-to-r
            from-cyan-400
            to-emerald-400
            text-black
            font-semibold
            disabled:opacity-50
          "
          >
            Create Group
          </button>

        </div>

      </div>

    </div>
  );
};

export default CreateGroupModal;