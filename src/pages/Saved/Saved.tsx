import { FaBookmark } from "react-icons/fa6";

import { useBookmarks } from "../../hooks/useBookmarks";
import PostCard from "../../components/PostCard/PostCard";
import Loader from "../../components/Loader/Loader";
import FeedError from "../../components/FeedError/FeedError";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import Seo from "../../components/Seo/Seo";

export default function Saved() {
  const { data: posts = [], isLoading, isError, isFetching, refetch } =
    useBookmarks();

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-950">
      <Seo
        title="Saved posts"
        description="Posts you saved on Wesal."
        noIndex
      />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-5 px-4 py-5 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <Sidebar />
        </aside>

        <main className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <FaBookmark className="text-yellow-500" />
              Saved posts
            </h1>

            {!isLoading && !isError && (
              <p className="mt-1 text-sm text-gray-500">
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </p>
            )}
          </section>

          {isLoading && <Loader />}

          {isError && (
            <FeedError onRetry={() => refetch()} isRetrying={isFetching} />
          )}

          {!isLoading && !isError && posts.length === 0 && (
            <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                Nothing saved yet
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Tap the bookmark icon on any post to keep it here.
              </p>
            </section>
          )}

          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </main>
      </div>
    </div>
  );
}
