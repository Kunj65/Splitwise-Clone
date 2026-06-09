import { useState } from "react";
import { Link } from "react-router-dom";
import { fetchJson } from "../api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetchJson("/api/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      setMessage(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-950/90 border border-slate-700 p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
        <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send a reset link.</p>

        {message && <div className="mb-4 rounded-xl bg-emerald-600/20 border border-emerald-500 px-4 py-3 text-sm text-emerald-300">{message}</div>}
        {error && <div className="mb-4 rounded-xl bg-red-600/90 px-4 py-3 text-sm text-white">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link to="/login" className="text-emerald-400 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;  