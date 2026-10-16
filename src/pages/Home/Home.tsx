import Sidebar from "../../Layout/Sidebar/Sidebar";
import Feed from "../../components/Feed/Feed";
import SuggestedFriends from "../../components/SuggestedFriends/SuggestedFriends";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-5 px-4 py-5 lg:grid-cols-[230px_minmax(0,1fr)_310px]">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <Sidebar />
        </aside>

        {/* Posts Feed */}
        <main className="min-w-0">
          <Feed />
        </main>

        {/* Suggested Friends */}
        <aside className="hidden lg:block">
          <SuggestedFriends />
        </aside>
      </div>
    </div>
  );
}
