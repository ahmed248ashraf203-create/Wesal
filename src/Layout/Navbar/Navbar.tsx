import { useContext, useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { DEFAULT_AVATAR, handleAvatarError } from "../../lib/avatar";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import { AuthencreatedContext } from "../../context/AuthenContext";
import {
  FaBars,
  FaUser,
  FaGear,
  FaChevronRight,
  FaRightFromBracket,
  FaHouse,
  FaBell,
  FaMoon,
  FaSun,
  FaFileLines,
  FaUsers,
  FaBookmark,
} from "react-icons/fa6";

const navLinks = [
  { name: "Feed", path: "/home", icon: FaHouse },
  { name: "Profile", path: "/profile", icon: FaUser },
  { name: "Notifications", path: "/notifications", icon: FaBell },
];

interface UserProfile {
  _id?: string;
  name?: string;
  username?: string;
  email?: string;
  photo?: string | null;
  image?: string | null;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      typeof window !== "undefined" && localStorage.getItem("theme") === "dark"
    );
  });

  const { token, removesetToken } = useContext(AuthencreatedContext);
  const unreadCount = useUnreadCount();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const { data: userData } = useQuery<UserProfile>({
    queryKey: ["userProfile", token],

    queryFn: async () => {
      const response = await api.get("/users/profile-data");

      const result =
        response.data?.user ??
        response.data?.data?.user ??
        response.data?.data ??
        response.data;

      return result;
    },

    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const userName = userData?.name || userData?.username || "My Account";

  const userEmail =
    userData?.email ||
    (userData?.username ? `@${userData.username}` : "Welcome back to Wesal!");

  const userPhoto = userData?.photo || userData?.image || DEFAULT_AVATAR;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4">
        {/* Logo */}
        <Link
          to="/home"
          className="group flex shrink-0 items-center gap-3 transition-all duration-300"
        >
          <div className="relative flex h-12 w-12 items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-violet-500/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />

            <img
              src="/wesal-logo.png"
              alt="Wesal"
              className="relative h-12 w-12 object-contain drop-shadow-sm transition-all duration-300 group-hover:drop-shadow-md"
            />
          </div>

          <span className="hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 bg-clip-text text-3xl min-[380px]:inline font-extrabold tracking-tight text-transparent transition-all duration-300 group-hover:from-blue-600 group-hover:via-indigo-500 group-hover:to-violet-500">
            wesal
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-3 lg:flex">
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
                      : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-300"
                  }`
                }
              >
                <Icon />
                {link.name}
                {link.path === "/notifications" && unreadCount > 0 && (
                  <span
                    aria-label={`${unreadCount} unread notifications`}
                    className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label="Open account menu"
            className={`group flex items-center gap-3 rounded-2xl border p-2 pr-3 transition-all duration-300 ${
              menuOpen
                ? "border-indigo-200 bg-indigo-50/70 shadow-md shadow-indigo-100/60 dark:border-indigo-500/60 dark:bg-indigo-950/40 dark:shadow-none"
                : "border-gray-200/80 bg-white hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-md hover:shadow-indigo-100/50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-500 dark:hover:bg-gray-800 dark:hover:shadow-none"
            }`}
          >
            {/* Profile Image */}
            <div className="rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-[2px] transition-transform duration-300 group-hover:scale-105">
              <img
                src={userPhoto}
                alt={userName}
                onError={handleAvatarError}
                className="h-10 w-10 rounded-full border-2 border-white object-cover dark:border-gray-800"
              />
            </div>

            {/* Account Info */}
            <div className="hidden max-w-[140px] text-left sm:block">
              <p className="truncate text-sm font-bold text-gray-800 transition-colors group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-300">
                {userName}
              </p>

              <p className="mt-0.5 truncate text-[11px] font-medium text-gray-400 dark:text-gray-500">
                Manage your profile
              </p>
            </div>

            <div
              className={`ml-1 flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 ${
                menuOpen
                  ? "rotate-90 bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"
                  : "bg-gray-50 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:bg-gray-800 dark:text-gray-300 dark:group-hover:bg-indigo-950 dark:group-hover:text-indigo-300"
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

              <div className="absolute right-0 z-50 mt-3 w-72 max-w-[calc(100vw-1.5rem)] origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl shadow-indigo-950/10 ring-1 ring-black/[0.03] dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/30 dark:ring-white/10">
                {/* Dropdown Header */}
                <div className="mb-2 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-4">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 rounded-full bg-white/20 p-[2px]">
                      <img
                        src={userPhoto}
                        alt={userName}
                        onError={handleAvatarError}
                        className="h-12 w-12 rounded-full border-2 border-white/70 object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-white">
                        {userName}
                      </p>

                      <p className="mt-1 truncate text-xs text-blue-100">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-1">
                  <Link
                    to="/my-posts"
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-gray-800 lg:hidden"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                      <FaFileLines className="text-base" />
                    </span>
                    <span className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
                      My Posts
                    </span>
                  </Link>

                  <Link
                    to="/community"
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-gray-800 lg:hidden"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                      <FaUsers className="text-base" />
                    </span>
                    <span className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Community
                    </span>
                  </Link>

                  <Link
                    to="/saved"
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-gray-800 lg:hidden"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                      <FaBookmark className="text-base" />
                    </span>
                    <span className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Saved
                    </span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-gray-800"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950 dark:text-blue-300">
                      <FaUser className="text-base" />
                    </span>

                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-gray-800 group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-300">
                        My Profile
                      </span>

                      <span className="mt-0.5 block text-xs text-gray-400 dark:text-gray-500">
                        View your profile
                      </span>
                    </span>

                    <FaChevronRight className="text-xs text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500 dark:text-gray-600 dark:group-hover:text-indigo-300" />
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-gray-800"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-all duration-200 group-hover:bg-violet-600 group-hover:text-white dark:bg-violet-950 dark:text-violet-300">
                      <FaGear className="text-base" />
                    </span>

                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-gray-800 group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-300">
                        Settings
                      </span>

                      <span className="mt-0.5 block text-xs text-gray-400 dark:text-gray-500">
                        Preferences & account
                      </span>
                    </span>

                    <FaChevronRight className="text-xs text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500 dark:text-gray-600 dark:group-hover:text-indigo-300" />
                  </Link>
                </div>

                {/* Dark Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setIsDark((current) => !current)}
                  aria-pressed={isDark}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-gray-800"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors dark:bg-indigo-950 dark:text-indigo-300">
                    {isDark ? (
                      <FaSun className="text-base" />
                    ) : (
                      <FaMoon className="text-base" />
                    )}
                  </span>

                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Dark mode
                    </span>

                    <span className="mt-0.5 block text-xs text-gray-400 dark:text-gray-500">
                      {isDark ? "On" : "Off"}
                    </span>
                  </span>

                  <span
                    className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                      isDark ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                    aria-hidden="true"
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        isDark ? "translate-x-[22px]" : "translate-x-0.5"
                      }`}
                    />
                  </span>
                </button>

                <div className="my-2 border-t border-gray-100 dark:border-gray-700" />

                {/* Logout */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    removesetToken();
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-all duration-200 group-hover:bg-red-500 group-hover:text-white dark:bg-red-950 dark:text-red-300">
                    <FaRightFromBracket className="text-base" />
                  </span>

                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-red-500">
                      Logout
                    </span>

                    <span className="mt-0.5 block text-xs text-gray-400 dark:text-gray-500">
                      Sign out of your account
                    </span>
                  </span>
                </button>

                <p className="pb-1 pt-2 text-center text-[10px] font-medium tracking-wide text-gray-400 dark:text-gray-500">
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
