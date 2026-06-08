import { useState } from "react";

const EditGroupModal = ({ group, onClose, onSave }) => {
  const [name, setName] = useState(group.name);
  const [members, setMembers] = useState([...group.members]);
  const [newMember, setNewMember] = useState("");

  /* ---------- UPDATE EXISTING MEMBER ---------- */
  const updateMember = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  /* ---------- ADD MEMBER ---------- */
  const addMember = () => {
    if (!newMember.trim()) return;
    setMembers([...members, newMember.trim()]);
    setNewMember("");
  };

  /* ---------- REMOVE MEMBER ---------- */
  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  /* ---------- SAVE ---------- */
  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      members: members.filter((m) => m.trim()),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#020617] w-full max-w-md rounded-2xl p-6 space-y-5 text-white">

        <h2 className="text-xl font-bold">
          Edit Group
        </h2>

        {/* GROUP NAME */}
        <div>
          <label className="text-sm text-gray-400">
            Group Name
          </label>
          <input
            className="w-full mt-1 p-2 rounded bg-black/40 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* MEMBERS */}
        <div>
          <p className="text-sm text-gray-400 mb-2">
            Members
          </p>

          {members.map((member, index) => (
            <div
              key={index}
              className="flex gap-2 items-center mb-2"
            >
              <input
                className="flex-1 p-2 rounded bg-black/40 outline-none"
                value={member}
                onChange={(e) =>
                  updateMember(index, e.target.value)
                }
              />
              <button
                onClick={() => removeMember(index)}
                className="text-red-400 text-sm"
              >
                ✕
              </button>
            </div>
          ))}

          {/* ADD MEMBER */}
          <div className="flex gap-2 mt-2">
            <input
              className="flex-1 p-2 rounded bg-black/40 outline-none"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              placeholder="Add new member"
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
            onClick={handleSave}
            className="bg-cyan-400 px-4 py-2 rounded text-black font-medium"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditGroupModal;