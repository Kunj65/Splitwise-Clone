import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import useAuth from "./useAuth";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-950/90 border border-slate-700 p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-6">Login</h1>

        {error && (
          <div className="mb-4 rounded-xl bg-red-600/90 px-4 py-3 text-sm text-white">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Login
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm text-slate-400">
          <p>
            <Link to="/forgot-password" className="text-emerald-400 hover:underline">
              Forgot password?
            </Link>
          </p>
          <p>
            <Link to="/login-otp" className="text-cyan-400 hover:underline">
              Login with OTP instead
            </Link>
          </p>
          <p>
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-emerald-400 hover:underline">
              Create one
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;