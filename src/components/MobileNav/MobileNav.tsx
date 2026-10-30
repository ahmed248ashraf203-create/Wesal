import { NavLink } from "react-router-dom";
import {
  FaHouse,
  FaBookmark,
  FaBell,
  FaUser,
  FaUsers,
} from "react-icons/fa6";
import { useUnreadCount } from "../../hooks/useUnreadCount";

const items = [
  { label: "Feed", path: "/home", icon: FaHouse },
  { label: "Community", path: "/community", icon: FaUsers },
  { label: "Saved", path: "/saved", icon: FaBookmark },
  { label: "Alerts", path: "/notifications", icon: FaBell },
  { label: "Profile", path: "/profile", icon: FaUser },
];

/**
 * Bottom tab bar for phones. The top Navbar links are hidden under 1024px, so
 * without this there was no way to reach Feed or Notifications on mobile.
 */
export default function MobileNav() {
  const unread = useUnreadCount();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden dark:border-gray-800 dark:bg-gray-950/95"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map(({ label, path, icon: Icon }) => (
          <li key={path} className="flex-1">
            <NavLink
              to={path}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-300"
                    : "text-gray-500 hover:text-indigo-600 dark:text-gray-400"
                }`
              }
            >
              <span className="relative">
                <Icon size={19} />
                {path === "/notifications" && unread > 0 && (
                  <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
