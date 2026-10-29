import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaMagnifyingGlass } from "react-icons/fa6";

import { AuthencreatedContext } from "../../context/AuthenContext";
import { useSuggestions } from "../../hooks/useSuggestions";
import { useFollow } from "../../hooks/useFollow";
import FriendRow from "./FriendRow";

export default function SuggestedFriends() {
  const { token } = useContext(AuthencreatedContext);
  const [search, setSearch] = useState("");

  const { friends, isLoading, isError, refetch, isFetching } =
    useSuggestions(10);
  const follow = useFollow();

  const filteredFriends = friends.filter((friend) =>
    `${friend.name} ${friend.username ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase().trim()),
  );

  if (!token) return null;

  return (
    <aside className="fixed right-[max(1rem,calc((100vw-1400px)/2))] top-20 hidden h-[calc(100vh-6rem)] w-[290px] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:block dark:border-gray-700 dark:bg-gray-900">
      <h2 className="mb-4 flex items-center gap-2 font-bold text-gray-900 dark:text-white">
        <FaUsers className="text-blue-600" />
        Suggested Friends
      </h2>

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-200 px-3 dark:border-gray-700">
        <FaMagnifyingGlass className="shrink-0 text-gray-400" />

        <input
          aria-label="Search suggested friends"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search friends..."
          className="min-w-0 flex-1 bg-transparent py-3 text-sm text-gray-900 outline-none dark:text-white"
        />
      </div>

      {isLoading && (
        <p className="py-6 text-center text-sm text-gray-500">
          Loading suggestions...
        </p>
      )}

      {isError && (
        <div className="py-4 text-center">
          <p className="mb-3 text-sm text-red-500">
            Failed to load suggestions.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {isFetching ? "Retrying..." : "Try again"}
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-3">
          {follow.error && (
            <p role="alert" className="text-xs text-red-500">
              {follow.error}
            </p>
          )}

          {filteredFriends.map((friend) => (
            <FriendRow
              key={friend._id}
              friend={friend}
              isFollowing={follow.isFollowing(friend._id, friend.isFollowing)}
              isPending={follow.isPending(friend._id)}
              onToggle={() => follow.toggle(friend._id, friend.isFollowing)}
            />
          ))}

          {filteredFriends.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">
              No friends found.
            </p>
          )}

          <Link
            to="/community"
            className="block pt-1 text-center text-xs font-semibold text-indigo-600 hover:underline"
          >
            See more people
          </Link>
        </div>
      )}
    </aside>
  );
}
