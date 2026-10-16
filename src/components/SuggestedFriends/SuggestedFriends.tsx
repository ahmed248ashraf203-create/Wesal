import { useState } from "react";
import {
  FaUsers,
  FaMagnifyingGlass,
  FaUserPlus,
  FaCheck,
} from "react-icons/fa6";

interface Friend {
  id: string;
  name: string;
  username: string;
  photo: string;
  followers: number;
}

const friends: Friend[] = [
  {
    id: "1",
    name: "Ahmed Abd Al-...",
    username: "ahmedmutti",
    photo: "https://i.pravatar.cc/100?img=11",
    followers: 373,
  },
  {
    id: "2",
    name: "Alaa Ashraf",
    username: "alaaashraf",
    photo: "https://i.pravatar.cc/100?img=47",
    followers: 305,
  },
  {
    id: "3",
    name: "MrMo",
    username: "mrmo",
    photo: "https://i.pravatar.cc/100?img=13",
    followers: 234,
  },
  {
    id: "4",
    name: "Menna",
    username: "gbngssssb",
    photo: "https://i.pravatar.cc/100?img=44",
    followers: 193,
  },
  {
    id: "5",
    name: "Abdalla Diaa",
    username: "abdalla_diaa",
    photo: "https://i.pravatar.cc/100?img=12",
    followers: 185,
  },
];

export default function SuggestedFriends() {
  const [search, setSearch] = useState("");
  const [following, setFollowing] = useState<string[]>([]);

  const filteredFriends = friends.filter((friend) =>
    `${friend.name} ${friend.username}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  function toggleFollow(id: string) {
    setFollowing((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
        <FaUsers className="text-blue-600" />
        Suggested Friends
      </h2>

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-200 px-3">
        <FaMagnifyingGlass className="shrink-0 text-gray-400" />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search friends..."
          className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
        />
      </div>

      <div className="space-y-3">
        {filteredFriends.map((friend) => {
          const isFollowing = following.includes(friend.id);

          return (
            <div
              key={friend.id}
              className="rounded-xl border border-gray-100 p-3"
            >
              <div className="flex items-center gap-2">
                <img
                  src={friend.photo}
                  alt={friend.name}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-gray-900">
                    {friend.name}
                  </h3>

                  <p className="truncate text-xs text-gray-500">
                    @{friend.username}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500">
                  {friend.followers} followers
                </span>

                <button
                  type="button"
                  onClick={() => toggleFollow(friend.id)}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    isFollowing
                      ? "bg-gray-100 text-gray-600"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  {isFollowing ? <FaCheck /> : <FaUserPlus />}
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            </div>
          );
        })}

        {filteredFriends.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">
            No friends found.
          </p>
        )}
      </div>
    </aside>
  );
}
