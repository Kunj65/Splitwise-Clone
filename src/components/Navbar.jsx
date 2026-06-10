import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <nav
      style={{
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
      className="text-white px-4 py-4 sticky top-0 z-50"
    >
      <div className="flex justify-between items-center max-w-5xl mx-auto">

        {/* Logo */}
        <Link to="/" className="text-emerald-400 text-2xl font-bold">
          Splitwise
        </Link>

        {/* DESKTOP nav — only shows on wide screens */}
        {user && !isMobile && (
          <div className="flex items-center gap-4">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className="hover:text-emerald-400 transition text-sm">
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="rounded-xl border border-emerald-400 px-4 py-1.5 text-emerald-400 text-sm hover:bg-emerald-400/10 transition"
            >
              Logout
            </button>
          </div>
        )}

        {/* MOBILE hamburger — only shows on narrow screens */}
        {user && isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "5px",
              width: "32px",
              height: "32px",
            }}
          >
            {/* Line 1 */}
            <span style={{
              display: "block",
              width: "22px",
              height: "2px",
              background: "white",
              borderRadius: "2px",
              transition: "transform 0.25s ease, opacity 0.25s ease",
              transformOrigin: "center",
              transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none",
            }} />
            {/* Line 2 */}
            <span style={{
              display: "block",
              width: "22px",
              height: "2px",
              background: "white",
              borderRadius: "2px",
              transition: "opacity 0.25s ease",
              opacity: menuOpen ? 0 : 1,
            }} />
            {/* Line 3 */}
            <span style={{
              display: "block",
              width: "22px",
              height: "2px",
              background: "white",
              borderRadius: "2px",
              transition: "transform 0.25s ease",
              transformOrigin: "center",
              transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none",
            }} />
          </button>
        )}

        {/* Not logged in */}
        {!user && (
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-emerald-400 text-sm">Login</Link>
            <Link to="/signup" className="hover:text-emerald-400 text-sm">Signup</Link>
          </div>
        )}
      </div>

      {/* Mobile dropdown */}
      {menuOpen && isMobile && user && (
        <div style={{
          background: "rgba(2,6,23,0.97)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          marginTop: "12px",
        }}>
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "13px 12px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                fontSize: "15px",
              }}
              className="hover:text-emerald-400 transition"
            >
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "13px 12px",
              fontSize: "15px",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            className="text-emerald-400"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;