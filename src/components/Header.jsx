import { Link, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { useState } from "react";

export default function Header({ session }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("session");
    localStorage.removeItem("selectedEmployee");
    setIsMenuOpen(false);
    // Trigger storage event manually (storage event doesn't fire in same window)
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  const closeMenu = () => setIsMenuOpen(false);

  // User is logged in if session exists
  const isLoggedIn = session;

  return (
    <header className="sticky top-0 z-50 bg-linear-to-r from-red-900 to-red-800 text-white shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2 text-xl md:text-2xl font-bold hover:opacity-80 transition-opacity"
          >
            <svg
              className="w-8 h-8 md:w-10 md:h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="hidden sm:inline">ClockMate</span>
            <span className="sm:hidden">ClockMate</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 text-sm font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="px-4 py-2 hover:bg-white/10 rounded-full transition-all duration-300 text-sm font-medium"
                >
                  Sign Up
                </Link>
                <Link
                  to="/"
                  className="px-4 py-2 hover:bg-white/10 rounded-full transition-all duration-300 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/admin-login"
                  className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-red-900 hover:bg-amber-300 rounded-full transition-all duration-300 text-sm font-semibold shadow-lg"
                >
                  <Settings/>
                  Admin Portal
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-all duration-300"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="py-4 space-y-2 border-t border-white/20">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-all duration-300 text-left"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-sm font-medium">Logout</span>
              </button>
            ) : (
              <>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  <span className="text-sm font-medium">Sign Up</span>
                </Link>
                <Link
                  to="/"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  <span className="text-sm font-medium">Login</span>
                </Link>
                <Link
                  to="/admin-login"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 bg-amber-400 text-red-900 hover:bg-amber-300 rounded-lg transition-all duration-300 font-semibold"
                >
                  <span className="text-sm flex gap-2 items-center"><Settings/>Admin Portal</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}