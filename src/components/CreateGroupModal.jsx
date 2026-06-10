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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#020617] w-full max-w-md rounded-2xl p-6 space-y-5 text-white">

        <h2 className="text-xl font-bold">Create Group</h2>

        {/* Group name */}
        <input
          className="w-full p-3 rounded-xl bg-black/40 outline-none border border-white/10 focus:border-emerald-400"
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        {/* Search members */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Add Members</p>
          <div className="relative">
            <input
              className="w-full p-3 rounded-xl bg-black/40 outline-none border border-white/10 focus:border-emerald-400"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searching && (
              <p className="text-xs text-gray-400 mt-1 px-1">Searching...</p>
            )}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
                {searchResults.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => addMember(u)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-sm shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Added members */}
        {members.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Added ({members.length})</p>
            {members.map((m) => (
              <div key={m._id} className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-xs">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                </div>
                <button onClick={() => removeMember(m._id)} className="text-red-400 text-lg leading-none">✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="text-gray-400 px-4 py-2">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={!groupName.trim()}
            className="bg-cyan-400 px-5 py-2 rounded-xl text-black font-medium disabled:opacity-50"
          >
            Create
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateGroupModal;