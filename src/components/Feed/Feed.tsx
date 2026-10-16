import { useContext } from "react";
import CreatePost from "../CreatePost/CreatePost";
import PostCard from "../PostCard/PostCard";
import type { Post } from "../../types/post";
import axios from "axios";
import { AuthencreatedContext } from "../../context/AuthenContext";
import { useQuery } from "@tanstack/react-query";
import Loader from "../Loader/Loader";
import FeedError from "../FeedError/FeedError";

export default function Feed() {
  const { token } = useContext(AuthencreatedContext);

  function getPosts() {
    return axios.get("https://route-posts.routemisr.com/posts", {
      headers: {
        token: token,
      },
    });
  }

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["allPosts"],
    queryFn: getPosts,
  });
  const posts: Post[] = data?.data?.data?.posts ?? [];
  function handleCreatePost(body: string) {
    console.log("New post:", body);
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
