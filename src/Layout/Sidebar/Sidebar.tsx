import { NavLink } from "react-router-dom";
import { FaHouse, FaFileLines, FaUsers, FaBookmark } from "react-icons/fa6";

const menuItems = [
  { label: "Feed", path: "/home", icon: FaHouse },
  { label: "My Posts", path: "/my-posts", icon: FaFileLines },
  { label: "Community", path: "/community", icon: FaUsers },
  { label: "Saved", path: "/saved", icon: FaBookmark },
];

export default function Sidebar() {
  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      <h2 className="mb-4 px-3 text-lg font-bold text-gray-900">Menu</h2>

      <div className="space-y-1">
        {menuItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
              }`
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
