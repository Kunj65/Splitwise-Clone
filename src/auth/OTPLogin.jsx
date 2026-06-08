import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchJson } from "../api";

const OTPLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail]     = useState("");
  const [otp, setOtp]         = useState("");
  const [step, setStep]       = useState("email"); // "email" | "otp"
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await fetchJson("/api/auth/send-otp", { method: "POST", body: { email } });
      setMessage("OTP sent! Check your email.");
      setStep("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetchJson("/api/auth/verify-otp", { method: "POST", body: { email, otp } });
      // Manually set auth state since we already have the token
      localStorage.setItem("splitwise_token", res.token);
      navigate("/");
      window.location.reload(); // refresh auth context
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-950/90 border border-slate-700 p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Login with OTP</h1>
        <p className="text-slate-400 text-sm mb-6">We'll send a 6-digit code to your email.</p>

        {message && <div className="mb-4 rounded-xl bg-emerald-600/20 border border-emerald-500 px-4 py-3 text-sm text-emerald-300">{message}</div>}
        {error && <div className="mb-4 rounded-xl bg-red-600/90 px-4 py-3 text-sm text-white">{error}</div>}

        {step === "email" ? (
          <form onSubmit={sendOTP} className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-300">Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400" />
            </label>
            <button type="submit" disabled={loading}
              className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50">
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOTP} className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-300">Enter OTP sent to {email}</span>
              <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white text-center text-2xl tracking-widest outline-none focus:border-emerald-400" />
            </label>
            <button type="submit" disabled={loading}
              className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50">
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button type="button" onClick={() => { setStep("email"); setOtp(""); setMessage(""); }}
              className="w-full text-sm text-slate-400 hover:text-white">
              ← Change email
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link to="/login" className="text-emerald-400 hover:underline">Login with password instead</Link>
        </p>
      </div>
    </div>
  );
};

export default OTPLogin;