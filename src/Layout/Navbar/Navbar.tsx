import { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthencreatedContext } from "../../context/AuthenContext";
import {
  FaBars,
  FaUser,
  FaGear,
  FaChevronRight,
  FaRightFromBracket,
  FaHouse,
  FaBell,
} from "react-icons/fa6";
const navLinks = [
  {
    name: "Feed",
    path: "/home",
    icon: FaHouse,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: FaUser,
  },
  {
    name: "Notifications",
    path: "/Notifications",
    icon: FaBell,
  },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { token, removesetToken } = useContext(AuthencreatedContext);
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link
          to="/home"
          className="group flex shrink-0 items-center gap-3 transition-all duration-300"
        >
          {/* Logo */}
          <div className="relative flex h-12 w-12 items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-violet-500/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />

            <img
              src="/wesal-logo.png"
              alt="Wesal"
              className="relative h-12 w-12 object-contain drop-shadow-sm transition-all duration-300 group-hover:drop-shadow-md"
            />
          </div>

          {/* Brand Name */}
          <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent transition-all duration-300 group-hover:from-blue-600 group-hover:via-indigo-500 group-hover:to-violet-500">
            wesal
          </span>
        </Link>

        {/* Dynamic Navigation Links */}
        <div className="hidden items-center gap-3 sm:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`
                }
              >
                <Icon />
                {link.name}
              </NavLink>
            );
          })}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Open account menu"
            className={`group flex items-center gap-3 rounded-2xl border p-2 pr-3 transition-all duration-300 ${
              menuOpen
                ? "border-indigo-200 bg-indigo-50/70 shadow-md shadow-indigo-100/60"
                : "border-gray-200/80 bg-white hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-md hover:shadow-indigo-100/50"
            }`}
          >
            {/* Profile Image */}
            <div className="rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-[2px] transition-transform duration-300 group-hover:scale-105">
              <img
                src="https://i.pravatar.cc/100?img=12"
                alt="Profile"
                className="h-10 w-10 rounded-full border-2 border-white object-cover"
              />
            </div>

            {/* Account Info */}
            <div className="hidden text-left sm:block">
              <p className="text-sm font-bold text-gray-800 transition-colors group-hover:text-indigo-600">
                My Account
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-gray-400">
                Manage your profile
              </p>
            </div>

            {/* Menu Icon */}
            <div
              className={`ml-1 flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 ${
                menuOpen
                  ? "rotate-90 bg-indigo-100 text-indigo-600"
                  : "bg-gray-50 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
              }`}
            >
              <FaBars className="text-sm" />
            </div>
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close account menu"
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />

              <div className="absolute right-0 z-50 mt-3 w-72 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl shadow-indigo-950/10 ring-1 ring-black/[0.03]">
                {/* Dropdown Header */}
                <div className="mb-2 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-white/20 p-[2px]">
                      <img
                        src="https://i.pravatar.cc/100?img=12"
                        alt="Profile"
                        className="h-12 w-12 rounded-full border-2 border-white/70 object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">
                        My Account
                      </p>
                      <p className="mt-1 text-xs text-blue-100">
                        Welcome back to Wesal!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-indigo-50"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white">
                      <FaUser className="text-base" />
                    </span>

                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-gray-800 group-hover:text-indigo-600">
                        My Profile
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-400">
                        View your profile
                      </span>
                    </span>

                    <FaChevronRight className="text-xs text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500" />
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-indigo-50"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-all duration-200 group-hover:bg-violet-600 group-hover:text-white">
                      <FaGear className="text-base" />
                    </span>

                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-gray-800 group-hover:text-indigo-600">
                        Settings
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-400">
                        Preferences & account
                      </span>
                    </span>

                    <FaChevronRight className="text-xs text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500" />
                  </Link>
                </div>

                {/* Divider */}
                <div className="my-2 border-t border-gray-100" />

                {/* Logout */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    removesetToken();
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 hover:bg-red-50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-all duration-200 group-hover:bg-red-500 group-hover:text-white">
                    <FaRightFromBracket className="text-base" />
                  </span>

                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-red-500">
                      Logout
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-400">
                      Sign out of your account
                    </span>
                  </span>
                </button>

                {/* Footer */}
                <p className="pb-1 pt-2 text-center text-[10px] font-medium tracking-wide text-gray-400">
                  MADE WITH ♥ BY WESAL
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
