import { useContext } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import CreatePost from "../CreatePost/CreatePost";
import PostCard from "../PostCard/PostCard";
import Loader from "../Loader/Loader";
import FeedError from "../FeedError/FeedError";

import type { Post } from "../../types/post";
import { AuthencreatedContext } from "../../context/AuthenContext";

const baseUrl = "https://route-posts.routemisr.com";

interface CreatePostPayload {
  body: string;
  image?: File;
}

export default function Feed() {
  const { token } = useContext(AuthencreatedContext);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["allPosts", token],

    queryFn: async () => {
      const response = await axios.get(`${baseUrl}/posts`, {
        headers: { token },
      });

      return response.data;
    },

    enabled: Boolean(token),
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: 30_000,
    retry: 1,
  });

  const posts: Post[] = data?.data?.posts ?? [];

  // إنشاء بوست بالنص والصورة باستخدام FormData
  const createPostMutation = useMutation({
    mutationFn: async ({ body, image }: CreatePostPayload) => {
      if (!token) {
        throw new Error("Please log in to create a post.");
      }

      const formData = new FormData();

      if (body.trim()) {
        formData.append("body", body.trim());
      }

      if (image) {
        formData.append("image", image);
      }

      const response = await axios.post(`${baseUrl}/posts`, formData, {
        headers: {
          token,
        },
      });

      return response.data;
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["allPosts", token],
        }),
        queryClient.invalidateQueries({
          queryKey: ["userPosts"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["userProfile", token],
        }),
      ]);
    },
  });

  async function handleCreatePost(
    body: string,
    image?: File,
  ): Promise<boolean> {
    if ((!body.trim() && !image) || createPostMutation.isPending) {
      return false;
    }

    try {
      await createPostMutation.mutateAsync({
        body: body.trim(),
        image,
      });

      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Create post error:",
          error.response?.data ?? error.message,
        );
      } else {
        console.error("Create post error:", error);
      }

      return false;
    }
  }

  if (!token) {
    return <p>Please log in to view posts.</p>;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <main className="min-w-0 space-y-4">
        <CreatePost onCreatePost={handleCreatePost} />

        <FeedError onRetry={() => refetch()} isRetrying={isFetching} />
      </main>
    );
  }

  return (
    <main className="min-w-0 space-y-4">
      <CreatePost onCreatePost={handleCreatePost} />

      {createPostMutation.isPending && (
        <p className="text-sm text-blue-600">Publishing your post...</p>
      )}

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
