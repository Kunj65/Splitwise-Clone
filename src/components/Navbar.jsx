import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
    setMenuOpen(false);
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/summary", label: "Summary" },
    { to: "/activity", label: "Activity" },
    { to: "/profile", label: "Profile" },
  ];

  return (
    <nav style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.1)" }} className="text-white px-4 py-4 sticky top-0 z-50">
      <div className="flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-emerald-400 text-2xl font-bold">
          Splitwise
        </Link>

        {user && (
          <>
            {/* Hamburger button — always visible on mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col justify-center gap-1.5 p-2 cursor-pointer"
              aria-label="Toggle menu"
            >
              <span
                style={{
                  display: "block",
                  width: "24px",
                  height: "2px",
                  background: "white",
                  borderRadius: "2px",
                  transition: "all 0.3s",
                  transform: menuOpen ? "rotate(45deg) translate(3px, 3px)" : "none",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: "24px",
                  height: "2px",
                  background: "white",
                  borderRadius: "2px",
                  transition: "all 0.3s",
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                style={{
                  display: "block",
                  width: "24px",
                  height: "2px",
                  background: "white",
                  borderRadius: "2px",
                  transition: "all 0.3s",
                  transform: menuOpen ? "rotate(-45deg) translate(3px, -3px)" : "none",
                }}
              />
            </button>
          </>
        )}

        {!user && (
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-emerald-400 text-sm">Login</Link>
            <Link to="/signup" className="hover:text-emerald-400 text-sm">Signup</Link>
          </div>
        )}
      </div>

      {/* Dropdown menu */}
      {menuOpen && user && (
        <div
          style={{
            background: "rgba(0,0,0,0.9)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            marginTop: "12px",
          }}
          className="flex flex-col"
        >
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              style={{ padding: "12px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              className="hover:text-emerald-400 transition text-sm"
            >
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            style={{ padding: "12px 8px", textAlign: "left" }}
            className="text-emerald-400 text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;