import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, ChevronDown, User, ClipboardList, PackageCheck, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NAV_LINKS = [
  { label: 'Services',   to: '/services'   },
  { label: 'Stay',       to: '/stay'       },
  { label: 'Transport',  to: '/transport'  },
  { label: 'Activities', to: '/activities' },
  { label: 'Partners',   to: '/partners'   },
];

const ACCOUNT_LINKS = [
  { label: 'Dashboard',       to: '/dashboard', icon: LayoutDashboard },
  { label: 'My Enquiries',    to: '/enquiries', icon: ClipboardList   },
  { label: 'My Bookings',     to: '/bookings',  icon: PackageCheck    },
  { label: 'Profile',         to: '/profile',   icon: User            },
];

export default function Navbar() {
  const [menuOpen,     setMenuOpen]     = useState(false); // mobile hamburger
  const [dropdownOpen, setDropdownOpen] = useState(false); // desktop user dropdown
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const firstName = user?.full_name?.split(' ')[0] || 'Account';
  const initials  = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="font-display text-xl text-text tracking-tight">
          Hop & Heal
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm transition-colors ${
                location.pathname === to ? 'text-accent' : 'text-muted hover:text-text'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop: theme toggle + auth */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="text-muted hover:text-text transition-colors p-2 rounded-full hover:bg-surface"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            /* ── User dropdown ── */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="flex items-center gap-2 text-sm border border-border rounded-full pl-1 pr-3 py-1 hover:border-accent/50 transition-colors bg-surface"
              >
                {/* Avatar circle */}
                <span className="w-7 h-7 rounded-full bg-accent text-[#080808] text-xs font-semibold flex items-center justify-center shrink-0">
                  {initials}
                </span>
                <span className="text-text font-medium">{firstName}</span>
                <ChevronDown
                  size={14}
                  className={`text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-surface border border-border rounded-2xl shadow-xl overflow-hidden py-1">
                  {ACCOUNT_LINKS.map(({ label, to, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-text hover:bg-surface-alt transition-colors"
                    >
                      <Icon size={14} className="shrink-0" />
                      {label}
                    </Link>
                  ))}
                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-muted hover:text-red-400 hover:bg-surface-alt transition-colors"
                    >
                      <LogOut size={14} className="shrink-0" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-muted hover:text-text transition-colors px-4 py-2"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-sm bg-accent text-[#080808] font-semibold px-4 py-2 rounded-full hover:bg-accent-hover transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="text-muted hover:text-text transition-colors p-2"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="text-muted hover:text-text"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-bg px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className="text-sm text-muted hover:text-text py-2 transition-colors"
            >
              {label}
            </Link>
          ))}

          <div className="pt-3 border-t border-border mt-2 flex flex-col gap-1">
            {user ? (
              <>
                <p className="text-xs text-muted-dark mb-1 px-0.5">{user.full_name}</p>
                {ACCOUNT_LINKS.map(({ label, to, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 text-sm text-muted hover:text-text py-2 transition-colors"
                  >
                    <Icon size={14} />
                    {label}
                  </Link>
                ))}
                <button
                  onClick={logout}
                  className="flex items-center gap-3 text-sm text-muted hover:text-red-400 py-2 transition-colors mt-1"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm text-muted py-2">Log in</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="text-sm bg-accent text-[#080808] font-semibold px-4 py-2 rounded-full">Get started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
