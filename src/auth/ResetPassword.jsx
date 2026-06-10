import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { fetchJson } from "../api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await fetchJson("/api/auth/reset-password", {
        method: "POST",
        body: { token, newPassword },
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message || "Invalid or expired reset link");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(135deg, #020617, #0f172a)" }}>
        <div className="bg-slate-900/80 border border-red-700 rounded-2xl p-8 text-center max-w-md w-full">
          <p className="text-red-400 mb-4">Invalid reset link. Please request a new one.</p>
          <Link to="/forgot-password" className="text-emerald-400 hover:underline text-sm">Request new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #020617, #0f172a)" }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-400 mb-2">Splitwise</h1>
          <p className="text-slate-400 text-sm">Smart Expense Splitting</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Password Reset!</h2>
              <p className="text-slate-400 text-sm">Redirecting you to login...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1">Set New Password</h2>
              <p className="text-slate-400 text-sm mb-6">Choose a strong password for your account.</p>

              {error && (
                <div className="bg-red-900/30 border border-red-700 rounded-xl p-3 mb-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-400 text-sm"
                    placeholder="Min. 6 characters"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-400 text-sm"
                    placeholder="Repeat new password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-400 text-slate-950 py-3 rounded-xl font-semibold hover:bg-emerald-300 transition disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;