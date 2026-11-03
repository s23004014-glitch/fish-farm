import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { FARM } from "../config.js";

// Small icons (no extra library needed)
const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const SearchIcon = () => (
  <Icon>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Icon>
);
const CartIcon = () => (
  <Icon>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
  </Icon>
);
const MenuIcon = () => (
  <Icon>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </Icon>
);
const CloseIcon = () => (
  <Icon>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
);

const links = [
  { to: "/", label: "Home" },
  { to: "/fish", label: "Fish" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isHome = pathname === "/";
  // Glass on top of the hero video, solid navy after scrolling (and on other pages)
  const solid = scrolled || !isHome || menuOpen;

  // Watch scrolling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus when the page changes
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // Close the profile dropdown when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    setDropdownOpen(false);
    navigate("/");
    toast.success("Logged out");
  };

  // Search icon: go to the search bar on the Home page
  const goToSearch = () => {
    setMenuOpen(false);
    if (isHome) {
      document.getElementById("search")?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("search-input")?.focus();
    } else {
      navigate("/", { state: { focusSearch: Date.now() } });
    }
  };

  const linkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive ? "bg-white/15 text-aqua-400" : "text-white/80 hover:bg-white/10 hover:text-white"
    }`;

  // Menu items for the logged-in user (same for desktop dropdown and mobile menu)
  const userItems =
    user?.role === "admin"
      ? [{ to: "/admin", label: "Admin Panel" }]
      : [
          { to: "/buyer", label: "Buyer Panel" },
          { to: "/buyer?tab=orders", label: "My Orders" },
        ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        solid
          ? "border-white/10 bg-gradient-to-r from-navy-900 via-navy-800 to-ocean-700 shadow-lg shadow-black/30"
          : "border-white/10 bg-white/5 backdrop-blur-md"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: logo and farm name */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-aqua-400 to-ocean-600 text-xl">
            🐠
          </span>
          <span className="text-lg font-bold tracking-wide">{FARM.name}</span>
        </Link>

        {/* Center links (desktop) */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={goToSearch} aria-label="Search fish" className="rounded-full p-2 transition hover:bg-white/10">
            <SearchIcon />
          </button>

          {/* Admin does not buy, so no cart for admin */}
          {user?.role !== "admin" && (
            <Link to="/cart" aria-label="Cart" className="relative rounded-full p-2 transition hover:bg-white/10">
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-500 px-1 text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Desktop: login button or profile dropdown */}
          <div className="hidden md:block">
            {!user ? (
              <Link to="/login" className="btn-primary !py-2 text-sm">
                Login / Register
              </Link>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 transition hover:bg-white/20"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-coral-500 to-coral-400 text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[100px] truncate text-sm">{user.name}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-white/15 bg-navy-800/95 py-1 shadow-xl backdrop-blur-xl">
                    {userItems.map((item) => (
                      <Link key={item.label} to={item.to} className="block px-4 py-2.5 text-sm transition hover:bg-white/10">
                        {item.label}
                      </Link>
                    ))}
                    <button onClick={handleLogout} className="block w-full px-4 py-2.5 text-left text-sm text-coral-400 transition hover:bg-white/10">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hamburger (mobile) */}
          <button onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" className="rounded-full p-2 hover:bg-white/10 md:hidden">
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="space-y-1 border-t border-white/10 px-4 pb-4 pt-2 md:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={({ isActive }) => `block rounded-lg px-4 py-3 ${isActive ? "bg-white/15 text-aqua-400" : "hover:bg-white/10"}`}>
              {l.label}
            </NavLink>
          ))}

          <div className="my-2 border-t border-white/10" />

          {!user ? (
            <Link to="/login" className="btn-primary mt-2 w-full">
              Login / Register
            </Link>
          ) : (
            <>
              <p className="px-4 py-1 text-xs text-white/50">Signed in as {user.name}</p>
              {userItems.map((item) => (
                <Link key={item.label} to={item.to} className="block rounded-lg px-4 py-3 hover:bg-white/10">
                  {item.label}
                </Link>
              ))}
              <button onClick={handleLogout} className="block w-full rounded-lg px-4 py-3 text-left text-coral-400 hover:bg-white/10">
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}