import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-300 ${
    isActive ? "bg-luxury-500 text-slate-950 shadow-lg shadow-luxury-500/20" : "text-slate-300 hover:bg-white/10 hover:text-white"
  }`;

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-luxury-500/15 bg-matte-950/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-luxury-500 text-slate-950 font-black shadow-lg shadow-luxury-500/20 transition-all duration-300 hover:scale-105 hover:shadow-luxury-500/30">
            TG
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-white">TripGenie AI</p>
            <p className="text-xs text-slate-400">Premium luxury travel SaaS</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/itineraries" className={linkClass}>
            Itineraries
          </NavLink>
          <NavLink to="/uploads" className={linkClass}>
            Uploads
          </NavLink>
          {isAuthenticated ? (
            <>
              <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur md:block">
                {user?.name}
              </div>
              <button onClick={logout} className="secondary-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
