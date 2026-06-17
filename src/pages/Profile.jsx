import { useState } from "react";
import useAuth from "../auth/useAuth";
import AnimatedPage from "../components/AnimatedPage";

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState("edit");

  const [editForm, setEditForm] = useState({
    name: user?.name || "",
  });

  const [saving, setSaving] = useState(false);

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      await updateProfile(editForm);
      alert("Profile updated successfully");
    } catch {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <AnimatedPage>
          <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">
          Profile
        </h1>

        <p className="text-slate-400 mt-2">
          Manage your account information and settings
        </p>
      </div>

      {/* Profile Card */}
      <div
        className="
          glass
          rounded-[32px]
          border
          border-white/10
          p-8
        "
      >
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Side */}
          <div className="lg:w-80">

            <div
              className="
                rounded-[32px]
                border
                border-white/10
                bg-white/[0.03]
                p-6
                text-center
              "
            >
              <div
                className="
                  h-28
                  w-28
                  mx-auto
                  rounded-full
                  bg-gradient-to-r
                  from-cyan-400
                  to-emerald-400
                  text-black
                  text-4xl
                  font-bold
                  flex
                  items-center
                  justify-center
                "
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>

              <h2 className="text-2xl font-bold mt-5">
                {user?.name}
              </h2>

              <p className="text-slate-400 mt-1 break-all">
                {user?.email}
              </p>

              <div
                className="
                  mt-5
                  inline-flex
                  px-4
                  py-2
                  rounded-full
                  bg-emerald-400/10
                  text-emerald-400
                  text-sm
                "
              >
                Active Member
              </div>
            </div>

            <div
              className="
                rounded-[32px]
                border
                border-white/10
                bg-white/[0.03]
                p-6
                mt-5
              "
            >
              <p className="text-slate-500 text-sm">
                Member Since
              </p>

              <h3 className="font-semibold mt-2">
                {new Date(
                  user?.createdAt || Date.now()
                ).toLocaleDateString()}
              </h3>
            </div>

          </div>

          {/* Right Side */}
          <div className="flex-1">

            {/* Tabs */}
            <div className="flex gap-3 mb-8">

              <button
                onClick={() => setActiveTab("edit")}
                className={`
                  px-5
                  py-3
                  rounded-2xl
                  font-medium
                  transition-all
                  ${
                    activeTab === "edit"
                      ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-black"
                      : "bg-white/[0.04] border border-white/10 text-slate-300"
                  }
                `}
              >
                Edit Profile
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`
                  px-5
                  py-3
                  rounded-2xl
                  font-medium
                  transition-all
                  ${
                    activeTab === "settings"
                      ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-black"
                      : "bg-white/[0.04] border border-white/10 text-slate-300"
                  }
                `}
              >
                Settings
              </button>

            </div>

            {/* Edit Tab */}
            {activeTab === "edit" && (
              <div
                className="
                  rounded-[32px]
                  border
                  border-white/10
                  bg-white/[0.03]
                  p-6
                "
              >
                <h3 className="text-2xl font-bold mb-6">
                  Edit Profile
                </h3>

                <form
                  onSubmit={handleEditSubmit}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          name: e.target.value,
                        })
                      }
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
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      Email Address
                    </label>

                    <input
                      value={user?.email}
                      disabled
                      className="
                        w-full
                        h-12
                        rounded-2xl
                        bg-black/20
                        border
                        border-white/10
                        px-4
                        text-slate-500
                      "
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="
                      px-6
                      py-3
                      rounded-2xl
                      bg-gradient-to-r
                      from-cyan-400
                      to-emerald-400
                      text-black
                      font-semibold
                      transition-all
                      hover:scale-[1.02]
                      disabled:opacity-50
                    "
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </form>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div
                className="
                  rounded-[32px]
                  border
                  border-white/10
                  bg-white/[0.03]
                  p-6
                "
              >
                <h3 className="text-2xl font-bold mb-6">
                  Account Settings
                </h3>

                <div
                  className="
                    rounded-3xl
                    border
                    border-red-500/20
                    bg-red-500/5
                    p-5
                  "
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                    <div>
                      <h4 className="font-semibold text-red-400">
                        Delete Account
                      </h4>

                      <p className="text-sm text-slate-400 mt-1">
                        Permanently remove your account and all associated data.
                      </p>
                    </div>

                    <button
                      className="
                        px-5
                        py-3
                        rounded-2xl
                        bg-red-500
                        hover:bg-red-600
                        transition
                      "
                    >
                      Delete Account
                    </button>

                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
    </AnimatedPage>
  );
};

export default Profile;