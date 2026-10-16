import { useContext } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

import CreatePost from "../CreatePost/CreatePost";
import PostCard from "../PostCard/PostCard";
import Loader from "../Loader/Loader";
import FeedError from "../FeedError/FeedError";

import type { Post } from "../../types/post";
import { AuthencreatedContext } from "../../context/AuthenContext";

export default function Feed() {
  const { token } = useContext(AuthencreatedContext);

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["allPosts", token],
    queryFn: async () => {
      const response = await axios.get(
        "https://route-posts.routemisr.com/posts",
        {
          headers: { token },
        },
      );

      return response.data;
    },
    enabled: Boolean(token),
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: 30_000,
    retry: 1,
  });

  const posts: Post[] = data?.data?.posts ?? [];

  function handleCreatePost(body: string) {
    console.log("New post:", body);
  }

  if (!token) {
    return <p>Please log in to view posts.</p>;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <main className="min-w-0">
        <CreatePost onCreatePost={handleCreatePost} />
        <FeedError onRetry={() => refetch()} isRetrying={isFetching} />
      </main>
    );
  }

  return (
    <main className="min-w-0 space-y-4">
      <CreatePost onCreatePost={handleCreatePost} />

      {isFetching && <p className="text-sm text-gray-500">Updating posts...</p>}

      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}

      {posts.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
          No posts yet.
        </div>
      )}
    </main>
  );
}
