import { useContext, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../../lib/api";
import Seo from "../Seo/Seo";

import CreatePost from "../CreatePost/CreatePost";
import PostCard from "../PostCard/PostCard";
import Loader from "../Loader/Loader";
import FeedError from "../FeedError/FeedError";

import { extractNextPage, extractPosts } from "../../types/post";
import type { Post } from "../../types/post";
import { AuthencreatedContext } from "../../context/AuthenContext";

const PAGE_SIZE = 10;

interface CreatePostPayload {
  body: string;
  image?: File;
}

export default function Feed() {
  const { token } = useContext(AuthencreatedContext);
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const targetPostId = searchParams.get("post");
  const postRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const highlightedPostRef = useRef<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["allPosts", token],

    initialPageParam: 1,

    queryFn: async ({ pageParam }) => {
      const response = await api.get("/posts", {
        params: { page: pageParam, limit: PAGE_SIZE },
      });

      return response.data;
    },

    // Use the server's nextPage when it sends one. If it doesn't, keep going
    // only while a page is full (and getNextPageParam below stops it when a
    // page brings nothing new, so an API that ignores `page` can't loop).
    getNextPageParam: (lastPage, allPages) => {
      const next = extractNextPage(lastPage);
      if (next) return next;

      const lastPosts = extractPosts(lastPage);
      const seen = new Set<string>();
      allPages.slice(0, -1).forEach((p) =>
        extractPosts(p).forEach((post) => seen.add(post._id)),
      );
      const addedNew = lastPosts.some((post) => !seen.has(post._id));

      return lastPosts.length >= PAGE_SIZE && addedNew
        ? allPages.length + 1
        : undefined;
    },

    enabled: Boolean(token),
    staleTime: 30_000,
    // Feed no longer re-downloads itself every 30 seconds. It refreshes on
    // focus / after the user's own actions (like, comment, post).
    retry: 1,
  });

  // Flatten the pages and drop duplicates.
  const posts: Post[] = (() => {
    const map = new Map<string, Post>();
    (data?.pages ?? []).forEach((page) =>
      extractPosts(page).forEach((post) => map.set(post._id, post)),
    );
    return Array.from(map.values());
  })();

  // Infinite scroll: load the next page when the sentinel is on screen.
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, posts.length]);

  // Scroll to the requested post when posts are available.
  useEffect(() => {
    if (!targetPostId || isLoading || isFetching || isFetchingNextPage) return;

    const postElement = postRefs.current[targetPostId];

    if (!postElement) return;

    postElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    highlightedPostRef.current = targetPostId;

    postElement.classList.add(
      "ring-2",
      "ring-blue-500",
      "ring-offset-4",
      "dark:ring-offset-gray-950",
    );

    const timeoutId = window.setTimeout(() => {
      postElement.classList.remove(
        "ring-2",
        "ring-blue-500",
        "ring-offset-4",
        "dark:ring-offset-gray-950",
      );

      if (highlightedPostRef.current === targetPostId) {
        highlightedPostRef.current = null;
      }
    }, 3000);

    // Remove the query parameter after handling the target post.
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete("post");
        return next;
      },
      { replace: true },
    );

    return () => window.clearTimeout(timeoutId);
  }, [
    targetPostId,
    posts,
    isLoading,
    isFetching,
    isFetchingNextPage,
    setSearchParams,
  ]);

  // Create post
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

      const response = await api.post("/posts", formData);

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

  const targetPostExists = posts.some(
    (post) => post._id === targetPostId || post.id === targetPostId,
  );

  return (
    <main className="min-w-0 space-y-4">
      <Seo
        title="Feed"
        description="See the latest posts from people you follow on Wesal."
        noIndex
      />
      <CreatePost onCreatePost={handleCreatePost} />

      {createPostMutation.isPending && (
        <p className="text-sm text-blue-600">Publishing your post...</p>
      )}

      {isFetching && !isFetchingNextPage && (
        <p className="text-sm text-gray-500" role="status">
          Updating posts...
        </p>
      )}

      {targetPostId && !isFetching && !targetPostExists && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          The requested post is not available in the currently loaded feed.
        </div>
      )}

      {posts.map((post) => {
        const postId = post._id ?? post.id;

        return (
          <div
            key={postId}
            ref={(element) => {
              postRefs.current[postId] = element;
            }}
            className="rounded-2xl transition-shadow duration-300"
          >
            <PostCard post={post} />
          </div>
        );
      })}

      {posts.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
          No posts yet.
        </div>
      )}

      {/* Infinite-scroll sentinel + manual fallback button */}
      {hasNextPage && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-60"
          >
            {isFetchingNextPage ? "Loading more posts..." : "Load more posts"}
          </button>
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <p className="py-4 text-center text-xs text-gray-400">
          You're all caught up.
        </p>
      )}
    </main>
  );
}
