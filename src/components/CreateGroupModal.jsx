import { useState } from "react";

const CreateGroupModal = ({ onClose, onCreate }) => {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState(["You"]);
  const [newMember, setNewMember] = useState("");

  const addMember = () => {
    if (!newMember.trim()) return;
    setMembers([...members, newMember.trim()]);
    setNewMember("");
  };

  const removeMember = (index) => {
    if (members[index] === "You") return;
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!groupName.trim() || members.length === 0) return;

    onCreate({
      name: groupName.trim(),
      members,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#020617] w-full max-w-md rounded-2xl p-6 space-y-5 text-white">

        <h2 className="text-xl font-bold">
          Create Group
        </h2>

        {/* GROUP NAME */}
        <input
          className="w-full p-2 rounded bg-black/40 outline-none"
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        {/* MEMBERS */}
        <div>
          <p className="text-sm text-gray-400 mb-2">
            Members
          </p>

          {members.map((m, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-black/30 p-2 rounded mb-1"
            >
              <span>{m}</span>
              {m !== "You" && (
                <button
                  onClick={() => removeMember(index)}
                  className="flex items-center justify-center p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
                  aria-label="Remove member"
                >
                  <span className="text-sm font-medium">✕</span>
                </button>


              )}
            </div>
          ))}

          <div className="flex gap-2 mt-2">
            <input
              className="flex-1 p-2 rounded bg-black/40 outline-none"
              placeholder="Add member"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
            />
            <button
              onClick={addMember}
              className="px-3 rounded bg-emerald-500 text-black"
            >
              Add
            </button>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="text-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="bg-cyan-400 px-4 py-2 rounded text-black font-medium"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;