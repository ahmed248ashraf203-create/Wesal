import { useContext, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  FaGlobe,
  FaEllipsis,
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaShare,
  FaBookmark,
  FaRegBookmark,
  FaPen,
  FaTrash,
  FaXmark,
  FaImage,
} from "react-icons/fa6";

import type { Post } from "../../types/post";
import DetailsPost from "../DetailsPost/DetailsPost";
import { AuthencreatedContext } from "../../context/AuthenContext";
import { getUserIdFromToken } from "./Getuseridfromtoken";
import ModalErrorBoundary from "./Modalerrorboundary";

interface PostCardProps {
  post: Post;
}

type LikeUser = string | { _id?: string };

const baseUrl = "https://route-posts.routemisr.com";

export default function PostCard({ post }: PostCardProps) {
  const { token } = useContext(AuthencreatedContext);
  const queryClient = useQueryClient();
  const currentUserId = getUserIdFromToken(token);

  const { user, body, createdAt, commentsCount, sharesCount, topComment } =
    post;

  const postOwnerId =
    typeof user === "string"
      ? user
      : (user as { _id?: string } | undefined)?._id;

  const isOwner = Boolean(
    token && currentUserId && postOwnerId && currentUserId === postOwnerId,
  );

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editBody, setEditBody] = useState(body ?? "");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editError, setEditError] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);

  const postImage =
    (post as Post & { image?: string; imageUrl?: string }).image ??
    (post as Post & { imageUrl?: string }).imageUrl;

  const [optimistic, setOptimistic] = useState<{
    liked: boolean;
    count: number;
  } | null>(null);

  // ---------------- GET POST LIKES ----------------

  const { data: likesData } = useQuery({
    queryKey: ["postLikes", post._id, token],
    queryFn: async () => {
      const response = await axios.get(`${baseUrl}/posts/${post._id}/likes`, {
        params: { page: 1, limit: 20 },
        headers: { token },
      });

      return response.data;
    },
    enabled: Boolean(token && post._id),
    staleTime: 30_000,
    retry: 1,
  });

  const likesList: LikeUser[] =
    likesData?.data?.likes ??
    likesData?.data?.data?.likes ??
    (Array.isArray(likesData?.data) ? likesData.data : []);

  const paginationInfo =
    likesData?.data?.paginationInfo ?? likesData?.paginationInfo;

  const totalFromServer: number | undefined =
    paginationInfo?.total ??
    paginationInfo?.totalItems ??
    paginationInfo?.numberOfItems;

  const serverLikesCount =
    totalFromServer ??
    (post as Post & { likesCount?: number }).likesCount ??
    likesList.length;

  const listIncludesMe = currentUserId
    ? likesList.some(
        (like) =>
          (typeof like === "string" ? like : like?._id) === currentUserId,
      )
    : false;

  const serverIsLiked =
    typeof (post as Post & { isLiked?: boolean }).isLiked === "boolean"
      ? (post as Post & { isLiked?: boolean }).isLiked!
      : listIncludesMe;

  const isLiked = optimistic?.liked ?? serverIsLiked;
  const likesCount = optimistic?.count ?? serverLikesCount;

  // ---------------- LIKE / UNLIKE ----------------

  const togglePostLikeMutation = useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error("You must be logged in to like a post.");
      }

      if (!post._id) {
        throw new Error("Post ID is missing.");
      }

      const response = await axios.put(
        `${baseUrl}/posts/${post._id}/like`,
        {},
        { headers: { token } },
      );

      return response.data;
    },

    onError: (error) => {
      console.error(
        "Like API error:",
        axios.isAxiosError(error) ? error.response?.data : error,
      );

      setOptimistic(null);
    },

    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["postLikes", post._id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["allPosts"],
        }),
      ]);

      setOptimistic(null);
    },
  });

  const handleLikeToggle = () => {
    if (!token || togglePostLikeMutation.isPending) return;

    setOptimistic({
      liked: !isLiked,
      count: Math.max(0, likesCount + (isLiked ? -1 : 1)),
    });

    togglePostLikeMutation.mutate();
  };

  // ---------------- UPDATE POST + IMAGE ----------------

  const updatePostMutation = useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error("Please log in first.");
      }

      if (!isOwner) {
        throw new Error("You can only edit your own posts.");
      }

      if (!post._id) {
        throw new Error("Post ID is missing.");
      }

      const formData = new FormData();
      formData.append("body", editBody.trim());

      if (editImage) {
        formData.append("image", editImage);
      }

      const response = await axios.put(
        `${baseUrl}/posts/${post._id}`,
        formData,
        {
          headers: { token },
        },
      );

      return response.data;
    },

    onSuccess: async () => {
      setIsEditOpen(false);
      setEditImage(null);
      setEditError("");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["allPosts"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["userPosts"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["userProfile", token],
        }),
      ]);
    },

    onError: (error) => {
      setEditError(
        axios.isAxiosError(error)
          ? (error.response?.data?.message ??
              "Failed to update post. Please try again.")
          : error instanceof Error
            ? error.message
            : "Failed to update post.",
      );
    },
  });

  const handleUpdatePost = () => {
    if (!token || !isOwner) {
      setEditError("You can only edit your own posts.");
      return;
    }

    if (!editBody.trim()) {
      setEditError("Post content cannot be empty.");
      return;
    }

    setEditError("");
    updatePostMutation.mutate();
  };

  // ---------------- DELETE POST ----------------

  const deletePostMutation = useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error("Please log in first.");
      }

      if (!isOwner) {
        throw new Error("You can only delete your own posts.");
      }

      if (!post._id) {
        throw new Error("Post ID is missing.");
      }

      const response = await axios.delete(`${baseUrl}/posts/${post._id}`, {
        headers: { token },
      });

      return response.data;
    },

    onSuccess: async () => {
      setIsDeleteOpen(false);
      setEditError("");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["allPosts"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["userPosts"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["userProfile", token],
        }),
      ]);
    },

    onError: (error) => {
      setEditError(
        axios.isAxiosError(error)
          ? (error.response?.data?.message ??
              "Failed to delete post. Please try again.")
          : error instanceof Error
            ? error.message
            : "Failed to delete post.",
      );
    },
  });

  return (
    <>
      <article className="group rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md sm:p-6">
        {/* User Info Header */}

        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3.5">
            <img
              src={user?.photo || "/default-avatar.png"}
              alt={user?.name || "User"}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/default-avatar.png";
              }}
              className="h-12 w-12 shrink-0 cursor-pointer rounded-full object-cover ring-2 ring-gray-50 transition-transform hover:scale-105"
            />

            <div className="min-w-0">
              <h3 className="truncate font-bold text-gray-900 transition-colors hover:text-blue-600">
                {user?.name || "Wesal Member"}
              </h3>

              <p className="truncate text-sm text-gray-500">
                @{user?.username || "member"}
              </p>

              <button
                type="button"
                onClick={() => setIsDetailsOpen(true)}
                className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-gray-400 transition-colors hover:text-blue-600"
              >
                <FaGlobe className="text-[10px]" />

                {createdAt
                  ? new Date(createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : ""}
              </button>
            </div>
          </div>

          {/* Owner Options */}

          {isOwner && (
            <div className="relative">
              <button
                type="button"
                aria-label="More options"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((previous) => !previous)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                <FaEllipsis size={18} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-10 z-30 w-44 rounded-xl border border-gray-100 bg-white p-1 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setEditBody(body ?? "");
                      setEditImage(null);
                      setEditError("");
                      setIsEditOpen(true);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <FaPen />
                    Edit post
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditError("");
                      setIsDeleteOpen(true);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FaTrash />
                    Delete post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post Text */}

        {body && (
          <p className="my-4 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-gray-800">
            {body}
          </p>
        )}

        {/* Post Image */}

        {postImage && (
          <div
            className="mb-4 cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50"
            onClick={() => setIsDetailsOpen(true)}
          >
            <img
              src={postImage}
              alt="Post attachment"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
              className="max-h-[500px] w-full object-contain transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
        )}

        {/* Shared Post Reference */}

        {post.sharedPost && (
          <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50/30 p-4 shadow-sm">
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">
              {post.sharedPost.body}
            </p>
          </div>
        )}

        {/* Action Toolbar */}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-1 sm:gap-4">
            {/* Like */}

            <button
              type="button"
              onClick={handleLikeToggle}
              disabled={!token || togglePostLikeMutation.isPending}
              aria-pressed={isLiked}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all hover:bg-red-50 disabled:opacity-50 ${
                isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
              }`}
            >
              {isLiked ? (
                <FaHeart
                  className="scale-110 transition-transform duration-200"
                  size={18}
                />
              ) : (
                <FaRegHeart size={18} />
              )}

              <span>{likesCount}</span>
            </button>

            {/* Comments */}

            <button
              type="button"
              onClick={() => setIsDetailsOpen(true)}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-gray-500 transition-all hover:bg-blue-50 hover:text-blue-600"
            >
              <FaRegComment size={18} />
              <span>{commentsCount ?? 0}</span>
              <span className="hidden sm:inline">Comments</span>
            </button>

            {/* Shares */}

            <button
              type="button"
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-gray-500 transition-all hover:bg-green-50 hover:text-green-600"
            >
              <FaShare size={18} />
              <span>{sharesCount ?? 0}</span>
              <span className="hidden sm:inline">Shares</span>
            </button>
          </div>

          {/* Bookmark */}

          <button
            type="button"
            onClick={() => setIsSaved((previous) => !previous)}
            aria-label="Save post"
            aria-pressed={isSaved}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-yellow-50 ${
              isSaved
                ? "text-yellow-500"
                : "text-gray-400 hover:text-yellow-500"
            }`}
          >
            {isSaved ? <FaBookmark size={18} /> : <FaRegBookmark size={18} />}
          </button>
        </div>

        {togglePostLikeMutation.isError && (
          <p role="alert" className="mt-3 text-xs text-red-500">
            Couldn't update your like. Please try again.
          </p>
        )}

        {/* Top Comment */}

        {topComment && (
          <div
            onClick={() => setIsDetailsOpen(true)}
            className="mt-4 cursor-pointer rounded-2xl bg-gray-50/80 px-4 py-3 transition-colors hover:bg-gray-100"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500">
                Top Comment
              </span>
            </div>

            <p className="line-clamp-2 text-sm text-gray-700">
              <span className="mr-1.5 font-bold text-gray-900">
                {topComment.commentCreator.name}:
              </span>
              {topComment.content}
            </p>
          </div>
        )}
      </article>

      {/* Edit Post Modal */}

      {isEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`edit-title-${post._id}`}
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
              <h2
                id={`edit-title-${post._id}`}
                className="text-lg font-bold text-gray-900"
              >
                Edit post
              </h2>

              <button
                type="button"
                aria-label="Close edit dialog"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditError("");
                }}
                disabled={updatePostMutation.isPending}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                <FaXmark />
              </button>
            </div>

            <textarea
              value={editBody}
              onChange={(event) => setEditBody(event.target.value)}
              disabled={updatePostMutation.isPending}
              placeholder="What's on your mind?"
              className="min-h-32 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white disabled:opacity-60"
            />

            {postImage && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-gray-600">
                  Current image
                </p>

                <img
                  src={postImage}
                  alt="Current post"
                  className="max-h-52 w-full rounded-xl bg-gray-50 object-contain"
                />
              </div>
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;

                if (file && !file.type.startsWith("image/")) {
                  setEditError("Please select an image file.");
                  event.target.value = "";
                  return;
                }

                setEditImage(file);
                setEditError("");
              }}
            />

            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={updatePostMutation.isPending}
              className="mt-3 flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <FaImage />
              {editImage ? "Choose another image" : "Change image"}
            </button>

            {editImage && (
              <div className="mt-2 flex items-center justify-between gap-3 text-sm text-gray-600">
                <span className="truncate">{editImage.name}</span>

                <button
                  type="button"
                  onClick={() => {
                    setEditImage(null);

                    if (imageInputRef.current) {
                      imageInputRef.current.value = "";
                    }
                  }}
                  className="shrink-0 text-red-600 hover:underline"
                >
                  Remove selection
                </button>
              </div>
            )}

            {editError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {editError}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditError("");
                }}
                disabled={updatePostMutation.isPending}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdatePost}
                disabled={updatePostMutation.isPending || !editBody.trim()}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatePostMutation.isPending ? "Saving..." : "Save changes"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Delete Confirmation Modal */}

      {isDeleteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`delete-title-${post._id}`}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <FaTrash size={22} />
            </div>

            <h2
              id={`delete-title-${post._id}`}
              className="mt-4 text-center text-xl font-bold text-gray-900"
            >
              Delete this post?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>

            {editError && (
              <p role="alert" className="mt-3 text-center text-sm text-red-600">
                {editError}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setEditError("");
                }}
                disabled={deletePostMutation.isPending}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => deletePostMutation.mutate()}
                disabled={deletePostMutation.isPending || !isOwner}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletePostMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Details Post Modal */}

      {isDetailsOpen && (
        <ModalErrorBoundary onClose={() => setIsDetailsOpen(false)}>
          <DetailsPost post={post} onClose={() => setIsDetailsOpen(false)} />
        </ModalErrorBoundary>
      )}
    </>
  );
}
