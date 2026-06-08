import { Link, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-black/40 text-white">
      <Link to="/" className="text-emerald-400 text-3xl font-bold">Splitwise</Link>

      {user ? (
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-emerald-400">Home</Link>
          <Link to="/summary" className="hover:text-emerald-400">Summary</Link>
          <Link to="/activity" className="hover:text-emerald-400">Activity</Link>
          <Link to="/profile" className="hover:text-emerald-400">Profile</Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-emerald-400 px-4 py-2 text-emerald-400 transition hover:bg-emerald-400/10"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link to="/login" className="hover:text-emerald-400">Login</Link>
          <Link to="/signup" className="hover:text-emerald-400">Signup</Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
