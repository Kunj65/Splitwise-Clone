import { useState } from "react";
import useAuth from "../auth/useAuth";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("edit");
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(editForm);
      alert("Profile updated!");
    } catch {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    alert("Password changed!");
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white py-6 px-4">
      <div className="max-w-4xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Profile</h1>
          <p className="text-slate-400 text-sm">Manage your account settings</p>
        </div>

        <div className="bg-slate-950/90 border border-slate-700 rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-6">

          {/* Avatar + Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-400 rounded-full flex items-center justify-center text-slate-950 text-2xl font-bold shrink-0">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold">{user.name}</h2>
              <p className="text-slate-400 text-sm">{user.email}</p>
              <p className="text-xs text-slate-500 mt-1">
                Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-700 mb-6">
            {["edit", "settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                  activeTab === tab
                    ? "bg-emerald-400 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Edit Tab */}
          {activeTab === "edit" && (
            <div className="max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400 text-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto bg-emerald-400 text-slate-950 px-6 py-2 rounded-xl font-semibold hover:bg-emerald-300 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-900/50 rounded-xl gap-3">
                <div>
                  <h4 className="font-medium text-sm">Change Password</h4>
                  <p className="text-xs text-slate-400">Update your account password</p>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm transition w-full sm:w-auto"
                >
                  Change
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-red-900/20 border border-red-800/50 rounded-xl gap-3">
                <div>
                  <h4 className="font-medium text-sm text-red-400">Delete Account</h4>
                  <p className="text-xs text-slate-400">Permanently delete your account</p>
                </div>
                <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition w-full sm:w-auto">
                  Delete
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
                <div key={field}>
                  <label className="block text-sm text-slate-300 mb-2 capitalize">
                    {field.replace(/([A-Z])/g, " $1")}
                  </label>
                  <input
                    type="password"
                    name={field}
                    value={passwordForm[field]}
                    onChange={(e) => setPasswordForm({ ...passwordForm, [field]: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400 text-sm"
                    required
                  />
                </div>
              ))}
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="submit" className="bg-emerald-400 text-slate-950 px-6 py-2 rounded-xl font-semibold hover:bg-emerald-300 transition">
                  Update Password
                </button>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="border border-slate-600 text-slate-300 px-6 py-2 rounded-xl hover:bg-slate-700 transition">
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