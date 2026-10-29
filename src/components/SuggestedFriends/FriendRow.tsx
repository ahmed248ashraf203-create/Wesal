import { Link } from "react-router-dom";
import { FaUserPlus, FaCheck } from "react-icons/fa6";
import type { Friend } from "../../hooks/useSuggestions";
import { DEFAULT_AVATAR, handleAvatarError } from "../../lib/avatar";

interface FriendRowProps {
  friend: Friend;
  isFollowing: boolean;
  isPending: boolean;
  onToggle: () => void;
}

export function getFollowersCount(friend: Friend): number {
  if (typeof friend.followersCount === "number") return friend.followersCount;
  if (Array.isArray(friend.followers)) return friend.followers.length;
  return Number(friend.followers ?? 0);
}

export default function FriendRow({
  friend,
  isFollowing,
  isPending,
  onToggle,
}: FriendRowProps) {
  return (
    <div className="rounded-xl border border-gray-100 p-3 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <Link to={`/profile/${friend._id}`} className="shrink-0">
          <img
            src={friend.photo || DEFAULT_AVATAR}
            alt={friend.name}
            onError={handleAvatarError}
            className="h-10 w-10 rounded-full object-cover"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-gray-900 dark:text-white">
            <Link to={`/profile/${friend._id}`} className="hover:underline">
              {friend.name}
            </Link>
          </h3>

          {friend.username && (
            <p className="truncate text-xs text-gray-500">@{friend.username}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500">
          {getFollowersCount(friend)} followers
        </span>

        <button
          type="button"
          onClick={onToggle}
          disabled={isPending}
          aria-pressed={isFollowing}
          className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-60 ${
            isFollowing
              ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400"
          }`}
        >
          {isFollowing ? <FaCheck /> : <FaUserPlus />}
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>
    </div>
  );
}
