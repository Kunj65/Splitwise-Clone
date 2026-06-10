import { useState } from "react";
import { Link } from "react-router-dom";
import { fetchJson } from "../api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await fetchJson("/api/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #020617, #0f172a)" }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-400 mb-2">Splitwise</h1>
          <p className="text-slate-400 text-sm">Smart Expense Splitting</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✉️</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Check your email</h2>
              <p className="text-slate-400 text-sm mb-6">
                If an account exists for <strong className="text-white">{email}</strong>, you'll receive a password reset link shortly.
              </p>
              <Link to="/login" className="text-emerald-400 hover:underline text-sm">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1">Forgot Password</h2>
              <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send you a reset link.</p>

              {error && (
                <div className="bg-red-900/30 border border-red-700 rounded-xl p-3 mb-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-400 text-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-400 text-slate-950 py-3 rounded-xl font-semibold hover:bg-emerald-300 transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-slate-400 text-sm mt-4">
                Remember your password?{" "}
                <Link to="/login" className="text-emerald-400 hover:underline">Login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;