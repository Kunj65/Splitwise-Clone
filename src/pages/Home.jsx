import { useState } from "react";
import { Link } from "react-router-dom";
import useGroups from "../context/useGroups";
import CreateGroupModal from "../components/CreateGroupModal";

const Home = () => {
  const { groups, addGroup, restoreGroup } = useGroups();
  const [showCreate, setShowCreate] = useState(false);

  const activeGroups = groups.filter((g) => !g.archived);
  const archivedGroups = groups.filter((g) => g.archived);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#020617] text-white py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Your Groups
          </h2>

          <button
            onClick={() => setShowCreate(true)}
            className="bg-cyan-400 text-black px-4 py-2 rounded-xl font-medium"
          >
            + Create Group
          </button>
        </div>

        {/* ACTIVE GROUPS */}
        {activeGroups.length === 0 ? (
          <p className="text-gray-400">
            No groups yet. Create one!
          </p>
        ) : (
          <div className="space-y-4">
            {activeGroups.map((g) => (
              <Link
                key={g.id}
                to={`/group/${g.id}`}
                className="block p-6 glass rounded-2xl"
              >
                <p className="font-semibold">{g.name}</p>
                <p className="text-sm text-gray-400">
                  {g.members.join(" · ")}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* ARCHIVED */}
        {archivedGroups.length > 0 && (
          <>
            <h3 className="mt-10 text-lg font-semibold text-gray-400">
              Archived Groups
            </h3>

            {archivedGroups.map((g) => (
              <div
                key={g.id}
                className="flex justify-between items-center p-4 bg-black/30 rounded mt-3"
              >
                <span>{g.name}</span>
                <button
                  onClick={() => restoreGroup(g.id)}
                  className="text-emerald-400"
                >
                  Restore
                </button>
              </div>
            ))}
          </>
        )}

      </div>

      {/* CREATE GROUP MODAL */}
      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreate={async (group) => {
            try {
              await addGroup(group);
              setShowCreate(false);
            } catch (error) {
              console.error("Failed to create group:", error);
              // You could show an error message to the user here
            }
          }}
        />
      )}
    </div>
  );
};

export default Home;