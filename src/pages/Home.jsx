import { useState } from "react";
import { Link } from "react-router-dom";
import useGroups from "../context/useGroups";
import CreateGroupModal from "../components/CreateGroupModal";
import AnimatedPage from "../components/AnimatedPage";

const Home = () => {
  const {
    groups,
    addGroup,
    restoreGroup,
    deleteGroup,
    loading,
  } = useGroups();

  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const activeGroups = groups.filter(
    (g) => !g.archived
  );

  const archivedGroups = groups.filter(
    (g) => g.archived
  );

  const handleDelete = async (e, groupId) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      "Are you sure you want to delete this group?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(groupId);

      await deleteGroup(groupId);
    } catch {
      alert("Failed to delete group");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AnimatedPage>
          <div className="text-slate-900 dark:text-white">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">

        <div>
          <h1 className="text-4xl font-bold mb-2">
            Your Groups
          </h1>

          <p className="text-slate-400">
            Track shared expenses and balances.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="
            mt-4
            md:mt-0
            px-6
            py-3
            rounded-2xl
            bg-gradient-to-r
            from-cyan-400
            to-emerald-400
            text-black
            font-semibold
          "
        >
          + Create Group
        </button>

      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">

        <div className="glass rounded-3xl p-5">
          <p className="text-slate-400 text-sm">
            Active Groups
          </p>

          <h3 className="text-3xl font-bold mt-2">
            {activeGroups.length}
          </h3>
        </div>

        <div className="glass rounded-3xl p-5">
          <p className="text-slate-400 text-sm">
            Archived Groups
          </p>

          <h3 className="text-3xl font-bold mt-2">
            {archivedGroups.length}
          </h3>
        </div>

        <div className="glass rounded-3xl p-5">
          <p className="text-slate-400 text-sm">
            Total Groups
          </p>

          <h3 className="text-3xl font-bold mt-2">
            {groups.length}
          </h3>
        </div>

      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                h-52
                rounded-3xl
                bg-white/5
                animate-pulse
              "
            />
          ))}
        </div>
      ) : activeGroups.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center">

          <h3 className="text-2xl font-semibold mb-3">
            No Groups Yet
          </h3>

          <p className="text-gray-400 py-10">
            Create your first group.
          </p>

          <button
            onClick={() => setShowCreate(true)}
            className="
              px-5
              py-3
              rounded-xl
              bg-cyan-400
              text-black
              font-semibold
            "
          >
            Create Group
          </button>

        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {activeGroups.map((group) => (
            <Link
              key={group.id || group._id}
              to={`/group/${group.id || group._id}`}
              className="
                glass
                rounded-3xl
                p-6
                hover:scale-[1.02]
                transition-all
              "
            >
              <div className="flex justify-between items-start mb-6">

                <div>
                  <h3 className="font-bold text-xl">
                    {group.name}
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    {(group.members || []).length} members
                  </p>
                </div>

                <button
                  onClick={(e) =>
                    handleDelete(
                      e,
                      group.id || group._id
                    )
                  }
                  disabled={
                    deletingId ===
                    (group.id || group._id)
                  }
                  className="
                    px-3
                    py-1.5
                    rounded-xl
                    bg-red-500/10
                    text-red-400
                  "
                >
                  {deletingId ===
                    (group.id || group._id)
                    ? "..."
                    : "Delete"}
                </button>

              </div>

              <div className="flex -space-x-2 mb-5">

                {(group.members || [])
                  .slice(0, 4)
                  .map((member, index) => {
                    const name =
                      typeof member === "object"
                        ? member.name
                        : member;

                    return (
                      <div
                        key={index}
                        className="
                          h-10
                          w-10
                          rounded-full
                          bg-cyan-400
                          text-black
                          font-bold
                          flex
                          items-center
                          justify-center
                          border-2
                          border-slate-900
                        "
                      >
                        {name?.charAt(0)}
                      </div>
                    );
                  })}

              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-sm text-slate-500">
                  Open Group →
                </p>
              </div>

            </Link>
          ))}

        </div>
      )}

      {archivedGroups.length > 0 && (
        <div className="mt-14">

          <h2 className="text-xl font-semibold mb-4">
            Archived Groups
          </h2>

          <div className="space-y-3">

            {archivedGroups.map((group) => (
              <div
                key={group.id || group._id}
                className="
                  glass
                  rounded-2xl
                  p-4
                  flex
                  justify-between
                  items-center
                "
              >
                <span>{group.name}</span>

                <button
                  onClick={() =>
                    restoreGroup(
                      group.id || group._id
                    )
                  }
                  className="text-emerald-400"
                >
                  Restore
                </button>

              </div>
            ))}

          </div>

        </div>
      )}

      {showCreate && (
        <CreateGroupModal
          onClose={() =>
            setShowCreate(false)
          }
          onCreate={async (group) => {
            await addGroup(group);
            setShowCreate(false);
          }}
        />
      )}

    </div>
    </AnimatedPage>
  );
};

export default Home;