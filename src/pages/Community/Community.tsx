import { useState } from "react";
import { FaUsers, FaMagnifyingGlass } from "react-icons/fa6";

import { useSuggestions } from "../../hooks/useSuggestions";
import { useFollow } from "../../hooks/useFollow";
import FriendRow from "../../components/SuggestedFriends/FriendRow";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import Seo from "../../components/Seo/Seo";

export default function Community() {
  const [search, setSearch] = useState("");
  const { friends, isLoading, isError, isFetching, refetch } =
    useSuggestions(30);
  const follow = useFollow();

  const visible = friends.filter((friend) =>
    `${friend.name} ${friend.username ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase().trim()),
  );

  return (
    <div className="min-h-dvh bg-[#f0f2f5] dark:bg-gray-950">
      <Seo
        title="Community"
        description="Discover people on Wesal and follow them."
        noIndex
      />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-5 px-4 py-5 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <Sidebar />
        </aside>

        <main className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <FaUsers className="text-blue-600" />
              Community
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              People you may want to follow.
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 px-3 dark:border-gray-700">
              <FaMagnifyingGlass className="shrink-0 text-gray-400" />
              <input
                aria-label="Search people"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search people..."
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-gray-900 outline-none dark:text-white"
              />
            </div>
          </section>

          {isLoading && (
            <p className="py-6 text-center text-sm text-gray-500">
              Loading people...
            </p>
          )}

          {isError && (
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-gray-900">
              <p className="mb-3 text-sm text-red-500">
                Couldn't load people right now.
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

          {follow.error && (
            <p role="alert" className="text-sm text-red-500">
              {follow.error}
            </p>
          )}

          {!isLoading && !isError && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((friend) => (
                <FriendRow
                  key={friend._id}
                  friend={friend}
                  isFollowing={follow.isFollowing(
                    friend._id,
                    friend.isFollowing,
                  )}
                  isPending={follow.isPending(friend._id)}
                  onToggle={() => follow.toggle(friend._id, friend.isFollowing)}
                />
              ))}

              {visible.length === 0 && (
                <p className="col-span-full py-6 text-center text-sm text-gray-500">
                  No people found.
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
