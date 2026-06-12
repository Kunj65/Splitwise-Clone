import { useState } from "react";
import { Link } from "react-router-dom";
import useGroups from "../context/useGroups";
import CreateGroupModal from "../components/CreateGroupModal";

const Home = () => {
  const { groups, addGroup, restoreGroup, deleteGroup } = useGroups();
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const activeGroups = groups.filter((g) => !g.archived);
  const archivedGroups = groups.filter((g) => g.archived);

  const handleDelete = async (e, groupId) => {
    e.preventDefault(); // prevent Link navigation
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this group? All expenses will be deleted too.")) return;
    setDeletingId(groupId);
    try {
      await deleteGroup(groupId);
    } catch {
      alert("Failed to delete group");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#020617] text-white py-8">
      <div className="max-w-4xl mx-auto px-4">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Groups</h2>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-cyan-400 text-black px-4 py-2 rounded-xl font-medium"
          >
            + Create Group
          </button>
        </div>

        {activeGroups.length === 0 ? (
          <p className="text-gray-400">No groups yet. Create one!</p>
        ) : (
          <div className="space-y-4">
            {activeGroups.map((g) => (
              <Link
                key={g.id}
                to={`/group/${g.id}`}
                className="flex justify-between items-center p-6 glass rounded-2xl hover:bg-white/5 transition"
              >
                <div>
                  <p className="font-semibold">{g.name}</p>
                  <p className="text-sm text-gray-400">
                    {(g.members || [])
                      .map((m) => (typeof m === "object" ? m.name : m))
                      .join(" · ")}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, g.id || g._id)}
                  disabled={deletingId === (g.id || g._id)}
                  className="ml-4 bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-1.5 rounded-xl text-sm transition disabled:opacity-50"
                >
                  {deletingId === (g.id || g._id) ? "Deleting..." : "Delete"}
                </button>
              </Link>
            ))}
          </div>
        )}

        {archivedGroups.length > 0 && (
          <>
            <h3 className="mt-10 text-lg font-semibold text-gray-400">Archived Groups</h3>
            {archivedGroups.map((g) => (
              <div
                key={g.id}
                className="flex justify-between items-center p-4 bg-black/30 rounded mt-3"
              >
                <span>{g.name}</span>
                <div className="flex gap-3">
                  <button onClick={() => restoreGroup(g.id)} className="text-emerald-400 text-sm">
                    Restore
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, g.id || g._id)}
                    className="text-red-400 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

      </div>

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreate={async (group) => {
            try {
              await addGroup(group);
              setShowCreate(false);
            } catch (error) {
              console.error("Failed to create group:", error);
            }
          }}
        />
      )}
    </div>
  );
};

export default Home;