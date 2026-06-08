import { useState } from "react";
import useAuth from "../auth/useAuth";
import useGroups from "../context/useGroups";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { groups, expensesByGroup } = useGroups();
  const [activeTab, setActiveTab] = useState("overview");
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const userGroups = groups.filter(group =>
    group.members.some(member => member.toLowerCase() === user?.name?.toLowerCase())
  );

  const userExpenses = Object.values(expensesByGroup)
    .flat()
    .filter(expense => expense.paidBy.toLowerCase() === user?.name?.toLowerCase())
    .length;

  const userAmount = Object.values(expensesByGroup)
    .flat()
    .filter(expense => expense.paidBy.toLowerCase() === user?.name?.toLowerCase())
    .reduce((sum, expense) => sum + expense.amount, 0);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateProfile(editForm);
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords don't match");
      return;
    }
    alert("Password changed successfully!");
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handlePasswordInputChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-slate-400">Manage your account settings and view your activity</p>
        </div>

        <div className="bg-slate-950/90 border border-slate-700 rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-emerald-400 rounded-full flex items-center justify-center text-slate-950 text-2xl font-bold">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-slate-400">{user.email}</p>
              <p className="text-sm text-slate-500 mt-1">
                Member since {new Date(user.createdAt || new Date()).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex gap-4 border-b border-slate-700 mb-6">
            {["overview", "edit", "settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === tab
                    ? "bg-emerald-400 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">Groups</h3>
                <p className="text-3xl font-bold text-emerald-400">{userGroups.length}</p>
                <p className="text-sm text-slate-400">Active groups</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">Expenses</h3>
                <p className="text-3xl font-bold text-emerald-400">{userExpenses}</p>
                <p className="text-sm text-slate-400">Total expenses paid</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">Amount</h3>
                <p className="text-3xl font-bold text-emerald-400">${userAmount.toFixed(2)}</p>
                <p className="text-sm text-slate-400">Total amount paid</p>
              </div>
            </div>
          )}

          {activeTab === "edit" && (
            <div className="max-w-md">
              <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-emerald-400 text-slate-950 px-6 py-2 rounded-xl font-semibold hover:bg-emerald-300 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                    <div>
                      <h4 className="font-medium">Change Password</h4>
                      <p className="text-sm text-slate-400">Update your account password</p>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm transition"
                    >
                      Change
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-slate-400">Receive updates about your groups</p>
                    </div>
                    <button className="bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-medium">
                      Enabled
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-900/20 border border-red-800/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-red-400">Delete Account</h4>
                      <p className="text-sm text-slate-400">Permanently delete your account</p>
                    </div>
                    <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-700 rounded-3xl p-8 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-emerald-400 text-slate-950 px-6 py-2 rounded-xl font-semibold hover:bg-emerald-300 transition"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="border border-slate-600 text-slate-300 px-6 py-2 rounded-xl hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;