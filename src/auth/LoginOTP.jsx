import { useState } from "react";
import { Link } from "react-router-dom";
import { fetchJson } from "../api";
import { setToken, setCurrentUser, safeUser } from "./auth.utils";

const LoginOTP = () => {


    const [step, setStep] = useState("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await fetchJson("/api/auth/send-otp", {
                method: "POST",
                body: { email },
            });
            setSuccess("OTP sent to your email!");
            setStep("otp");
        } catch (err) {
            setError(err.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const data = await fetchJson("/api/auth/verify-otp", {
                method: "POST",
                body: { email, otp },
            });

            // Use correct keys matching AuthProvider
            setToken(data.token);
            setCurrentUser(safeUser(data.user));

            // Full reload so AuthProvider re-reads from localStorage
            window.location.href = "/";
        } catch (err) {
            setError(err.message || "Invalid or expired OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-3xl bg-slate-950/90 border border-slate-700 p-8 shadow-xl">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-emerald-400 mb-1">Splitwise</h1>
                    <p className="text-slate-400 text-sm">Login with OTP</p>
                </div>

                {error && (
                    <div className="mb-4 rounded-xl bg-red-600/90 px-4 py-3 text-sm text-white">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 rounded-xl bg-emerald-600/90 px-4 py-3 text-sm text-white">
                        {success}
                    </div>
                )}

                {step === "email" && (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-300 mb-2">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-300 transition disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </form>
                )}

                {step === "otp" && (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-300 mb-2">
                                Enter the 6-digit code sent to <strong>{email}</strong>
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400 text-center text-2xl tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                            <p className="text-xs text-slate-500 mt-2">Code expires in 10 minutes</p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-300 transition disabled:opacity-50"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setStep("email"); setOtp(""); setError(""); setSuccess(""); }}
                            className="w-full text-slate-400 text-sm hover:text-white transition"
                        >
                            Use a different email
                        </button>
                    </form>
                )}

                <div className="mt-6 space-y-2 text-center text-sm text-slate-400">
                    <p>
                        <Link to="/login" className="text-emerald-400 hover:underline">
                            Login with password instead
                        </Link>
                    </p>
                    <p>
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-emerald-400 hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default LoginOTP;