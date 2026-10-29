import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "../lib/api";
import type { Post } from "../types/post";

/**
 * PUT /posts/:id/bookmark  (toggles bookmark / unbookmark)
 *
 * The button flips immediately (optimistic) and rolls back on error. Once the
 * refreshed post comes back with the same value, the override is dropped and
 * the server value takes over again.
 */
export function useBookmark(post: Pick<Post, "_id" | "bookmarked">) {
  const queryClient = useQueryClient();
  const [override, setOverride] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const serverValue = Boolean(post.bookmarked);
  const isBookmarked = override ?? serverValue;

  useEffect(() => {
    if (override !== null && serverValue === override) {
      setOverride(null);
    }
  }, [serverValue, override]);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.put(`/posts/${post._id}/bookmark`);
      return data;
    },

    onMutate: () => {
      setError("");
      setOverride(!isBookmarked);
    },

    onSuccess: (data) => {
      const returned = data?.data?.bookmarked ?? data?.bookmarked;
      if (typeof returned === "boolean") setOverride(returned);
    },

    onError: (err) => {
      setOverride(null);
      setError(getErrorMessage(err, "Couldn't update your saved posts."));
    },

    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["bookmarks"] }),
        queryClient.invalidateQueries({ queryKey: ["allPosts"] }),
        queryClient.invalidateQueries({ queryKey: ["userPosts"] }),
        queryClient.invalidateQueries({ queryKey: ["myPosts"] }),
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
      ]);
    },
  });

  return {
    isBookmarked,
    isPending: mutation.isPending,
    error,
    toggle: () => {
      if (!mutation.isPending) mutation.mutate();
    },
  };
}
