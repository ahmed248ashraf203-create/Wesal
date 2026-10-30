import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";

import { AuthencreatedContext } from "../../context/AuthenContext";
import type { Post } from "../../types/post";

import PostCard from "../PostCard/PostCard";
import Loader from "../Loader/Loader";
import FeedError from "../FeedError/FeedError";
import { getUserIdFromToken } from "../PostCard/Getuseridfromtoken";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import Seo from "../Seo/Seo";
import { api } from "../../lib/api";
import { extractPosts } from "../../types/post";

export default function MyPosts() {
  const { token } = useContext(AuthencreatedContext);

  // استخراج بيانات المستخدم من الـ JWT
  const userId = getUserIdFromToken(token);

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["myPosts", token, userId],

    queryFn: async () => {
      if (!token || !userId) {
        throw new Error("Unable to identify the current user.");
      }

      const response = await api.get(`/users/${userId}/posts`);

      return response.data;
    },

    enabled: Boolean(token && userId),
    staleTime: 0,
    refetchOnMount: "always",
    retry: 1,
  });

  const posts: Post[] = extractPosts(data);

  if (!token) {
    return <p>Please log in to view your posts.</p>;
  }

  if (!userId) {
    return (
      <p className="rounded-xl bg-white p-5 text-center text-red-600">
        Unable to identify your account. Please log in again.
      </p>
    );
  }

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <main className="min-w-0 space-y-4">
        <FeedError onRetry={() => refetch()} isRetrying={isFetching} />
      </main>
    );
  }
  return (
    <div className="min-h-dvh bg-[#f0f2f5]">
      <Seo title="My posts" description="Everything you posted on Wesal." noIndex />
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-5 px-4 py-5 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <Sidebar />
        </aside>

        <main className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h1 className="text-xl font-bold text-gray-900">My Posts</h1>

            <p className="mt-1 text-sm text-gray-500">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </p>
          </section>

          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          ) : (
            <section className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <h2 className="font-semibold text-gray-800">No posts yet</h2>
              <p className="mt-2 text-sm text-gray-500">
                Your posts will appear here when you publish them.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
