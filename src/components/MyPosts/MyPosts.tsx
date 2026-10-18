import { useContext } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

import { AuthencreatedContext } from "../../context/AuthenContext";
import type { Post } from "../../types/post";

import PostCard from "../PostCard/PostCard";
import Loader from "../Loader/Loader";
import FeedError from "../FeedError/FeedError";
import { getUserIdFromToken } from "../PostCard/Getuseridfromtoken";
import Sidebar from "../../Layout/Sidebar/Sidebar";

const baseUrl = "https://route-posts.routemisr.com";

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

      const response = await axios.get(`${baseUrl}/users/${userId}/posts`, {
        headers: { token },
      });

      return response.data;
    },

    enabled: Boolean(token && userId),
    staleTime: 0,
    refetchOnMount: "always",
    retry: 1,
  });

  const posts: Post[] = data?.data?.posts ?? data?.data?.postsFeed ?? [];

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
    <div className="min-h-screen bg-[#f0f2f5]">
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

function getCurrentUserId(token: string | null | undefined): string | null {
  try {
    if (!token) return null;

    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");

    const decoded = JSON.parse(
      atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")),
    );

    return (
      decoded.user?._id ?? decoded.userId ?? decoded.id ?? decoded._id ?? null
    );
  } catch {
    return null;
  }
}
