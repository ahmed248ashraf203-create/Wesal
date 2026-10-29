import { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  FaXmark,
  FaGlobe,
  FaRegComment,
  FaPaperPlane,
  FaThumbsUp,
  FaRegThumbsUp,
  FaReply,
} from "react-icons/fa6";

import type { Post } from "../../types/post";
import { AuthencreatedContext } from "../../context/AuthenContext";
import PostsError from "./PostsError";
import UpdateDeleteComment, { EditCommentForm } from "./UpdateDeleteComment";
import { getUserIdFromToken } from "../PostCard/Getuseridfromtoken";
import { api } from "../../lib/api";
import { DEFAULT_AVATAR, handleAvatarError } from "../../lib/avatar";
import { fullDate, timeAgo } from "../../lib/time";
import { useModalA11y } from "../../hooks/useModalA11y";
import { extractNextPage } from "../../types/post";

interface DetailsPostProps {
  post: Post;
  onClose: () => void;
}

interface CommentType {
  _id: string;
  content: string;
  createdAt?: string;
  // الحقول دي بتيجي من السيرفر - اتأكد من الشكل الفعلي بـ console.log(comment)
  likes?: Array<string | { _id?: string }>;
  likesCount?: number;
  isLiked?: boolean;
  commentCreator?: {
    _id?: string;
    name?: string;
    username?: string;
    photo?: string;
  };
}


// --------------------------------------------------------
// مكون فرعي لكل تعليق - الإعجاب بيتخزن في السيرفر
// --------------------------------------------------------
function CommentItem({
  comment,
  postId,
  token,
  currentUserId,
  onReplyClick,
}: {
  comment: CommentType;
  postId: string;
  token: string;
  currentUserId: string | null;
  onReplyClick: (username: string) => void;
}) {
  const creatorId = comment.commentCreator?._id;
  const creatorPath =
    creatorId && creatorId !== currentUserId
      ? `/profile/${creatorId}`
      : "/profile";
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // الـ Edit والـ Delete لصاحب الكومنت بس
  const isOwner = Boolean(
    currentUserId && comment.commentCreator?._id === currentUserId,
  );

  // الحالة بتتحسب من الداتا اللي جاية من السيرفر مش من useState
  const likes = comment.likes ?? [];
  const likesCount = comment.likesCount ?? likes.length;
  const isLiked =
    comment.isLiked ??
    (currentUserId
      ? likes.some(
          (like) =>
            (typeof like === "string" ? like : like?._id) === currentUserId,
        )
      : false);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await api.put(
        `/posts/${postId}/comments/${comment._id}/like`,
      );
      return response.data;
    },
    onSuccess: async () => {
      // نعيد جلب الكومنتات عشان تيجي بحالة الايك الجديدة
      await queryClient.invalidateQueries({
        queryKey: ["postComments", postId, token],
      });
    },
  });

  return (
    <article className="group flex gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <Link to={creatorPath} className="shrink-0">
        <img
          src={comment.commentCreator?.photo || DEFAULT_AVATAR}
          alt={comment.commentCreator?.name || "User"}
          onError={handleAvatarError}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-50"
        />
      </Link>

      <div className="min-w-0 flex-1">
        {isEditing ? (
          <EditCommentForm
            postId={postId}
            commentId={comment._id}
            token={token}
            initialContent={comment.content}
            onCancel={() => setIsEditing(false)}
            onSaved={() => setIsEditing(false)}
          />
        ) : (
          <div className="flex items-center gap-1">
            <div className="min-w-0 flex-1 rounded-2xl rounded-tl-none bg-gray-50/80 px-3 py-2.5">
              <Link
                to={creatorPath}
                className="block font-bold text-gray-900 text-[14px] hover:underline"
              >
                {comment.commentCreator?.name || "User"}
              </Link>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">
                {comment.content}
              </p>
            </div>

            {isOwner && (
              <UpdateDeleteComment
                postId={postId}
                commentId={comment._id}
                token={token}
                onEdit={() => setIsEditing(true)}
              />
            )}
          </div>
        )}

        {/* أزرار التفاعل (Like, Reply, Time) */}
        <div className="mt-2 flex items-center gap-4 px-2 text-[12px] font-semibold text-gray-500">
          {comment.createdAt && (
            <time
              dateTime={comment.createdAt}
              title={fullDate(comment.createdAt)}
              className="text-gray-400 font-normal"
            >
              {timeAgo(comment.createdAt)}
            </time>
          )}

          <div className="flex items-center gap-3">
            {/* زر Like (Like / Unlike toggle من السيرفر) */}
            <button
              type="button"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              aria-pressed={isLiked}
              className={`flex items-center gap-1 transition-colors hover:text-blue-600 disabled:opacity-60 ${
                isLiked ? "text-blue-600" : ""
              }`}
            >
              {isLiked ? <FaThumbsUp size={14} /> : <FaRegThumbsUp size={14} />}
              <span>{isLiked ? "Liked" : "Like"}</span>
              {likesCount > 0 && <span>· {likesCount}</span>}
            </button>

            {/* زر Reply */}
            <button
              type="button"
              onClick={() =>
                onReplyClick(comment.commentCreator?.name || "User")
              }
              className="flex items-center gap-1 transition-colors hover:text-gray-900"
            >
              <FaReply size={13} />
              <span>Reply</span>
            </button>
          </div>
        </div>

        {likeMutation.isError && (
          <p role="alert" className="mt-1 px-2 text-xs text-red-500">
            Couldn't update your like. Please try again.
          </p>
        )}
      </div>
    </article>
  );
}

// --------------------------------------------------------
// المكون الرئيسي (DetailsPost)
// --------------------------------------------------------
export default function DetailsPost({ post, onClose }: DetailsPostProps) {
  const { token } = useContext(AuthencreatedContext);
  const queryClient = useQueryClient();
  const currentUserId = getUserIdFromToken(token);

  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const dialogRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  useModalA11y(dialogRef, onClose);

  // Infinite query: "Load more" now APPENDS the next page to the list
  // instead of replacing the first page.
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
    queryKey: ["postComments", post._id, token],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await api.get(`/posts/${post._id}/comments`, {
        params: { page: pageParam, limit: 10 },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => extractNextPage(lastPage),
    enabled: Boolean(token && post._id),
    staleTime: 0,
    retry: 1,
  });

  const comments: CommentType[] = (() => {
    const map = new Map<string, CommentType>();

    (data?.pages ?? []).forEach((page) => {
      const list: CommentType[] =
        page?.data?.comments ??
        page?.data?.data?.comments ??
        (Array.isArray(page?.data) ? page.data : []);

      list.forEach((comment) => map.set(comment._id, comment));
    });

    return Array.from(map.values());
  })();

  const addCommentMutation = useMutation({
    mutationFn: async (commentContent: string) => {
      const response = await api.post(`/posts/${post._id}/comments`, {
        content: commentContent,
      });
      return response.data;
    },

    onSuccess: async () => {
      setContent("");
      setReplyingTo(null);
      await queryClient.invalidateQueries({
        queryKey: ["postComments", post._id, token],
      });
      await queryClient.invalidateQueries({ queryKey: ["allPosts", token] });
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent || !token || addCommentMutation.isPending) return;
    addCommentMutation.mutate(trimmedContent);
  }

  // Reply = mention the author, show who we're replying to, and focus the box.
  // (A real nested reply needs its own endpoint; this keeps the mention.)
  const handleReplyClick = (username: string) => {
    const mention = `@${username} `;

    setReplyingTo(username);
    setContent((prev) => (prev.includes(mention) ? prev : mention + prev));
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const { user, body, createdAt } = post;
  const postImage = post.image ?? post.imageUrl;
  const authorPath = user?._id ? `/profile/${user._id}` : "/profile";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-3 backdrop-blur-sm transition-all sm:p-5"
      onClick={onClose}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-post-title"
        className="flex h-[90dvh] min-h-0 w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-gray-100 bg-white/90 px-6 py-4 backdrop-blur-md">
          <h2
            id="details-post-title"
            className="text-xl font-extrabold tracking-tight text-gray-900"
          >
            Post Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition-all hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          >
            <FaXmark size={20} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-row">
          {/* Post Content Area */}
          <div className="flex shrink-0 flex-col overflow-y-auto border-b border-gray-100 p-6 sm:w-[50%] sm:border-b-0 sm:border-r [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
            <div className="mb-4 flex items-center gap-4">
              <Link to={authorPath} onClick={onClose} className="shrink-0">
                <img
                  src={user.photo || DEFAULT_AVATAR}
                  alt={user.name || "User"}
                  onError={handleAvatarError}
                  className="h-12 w-12 rounded-full border-2 border-transparent object-cover ring-2 ring-gray-100"
                />
              </Link>
              <div className="min-w-0">
                <h3 className="truncate font-bold text-gray-900 hover:underline">
                  <Link to={authorPath} onClick={onClose}>
                    {user.name}
                  </Link>
                </h3>
                <p className="truncate text-sm text-gray-500">
                  @{user.username}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                  <FaGlobe className="text-[10px]" />
                  <time dateTime={createdAt} title={fullDate(createdAt)}>
                    {timeAgo(createdAt)}
                  </time>
                </p>
              </div>
            </div>

            {body && (
              <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-gray-800">
                {body}
              </p>
            )}

            {postImage && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50">
                <img
                  src={postImage}
                  alt="Post attachment"
                  className="max-h-[300px] w-full object-contain transition-transform hover:scale-[1.02] duration-300"
                />
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="flex min-h-0 flex-1 flex-col bg-gray-50/30">
            <div className="shrink-0 border-b border-gray-100 bg-white px-6 py-4">
              <h3 className="flex items-center gap-2 font-bold text-gray-900">
                <FaRegComment className="text-blue-500" />
                Comments
                {(post.commentsCount ?? comments.length) > 0 && (
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    {post.commentsCount ?? comments.length}
                  </span>
                )}
              </h3>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 space-y-4 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
              {!token && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-3 rounded-full bg-gray-100 p-4">
                    <FaRegComment size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    Please log in to view and add comments.
                  </p>
                </div>
              )}

              {token && isLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex gap-3 animate-pulse">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 w-1/4 rounded bg-gray-200"></div>
                        <div className="h-10 w-3/4 rounded-2xl bg-gray-200"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {token && isError && (
                <PostsError
                  title="Couldn't load comments"
                  message="Something went wrong while loading the comments. Please check your connection and try again."
                  onRetry={() => refetch()}
                  isRetrying={isFetching}
                />
              )}

              {token && !isLoading && !isError && comments.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center py-8 text-center opacity-70">
                  <FaRegComment size={36} className="mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-700">
                    No comments yet
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Be the first to start the conversation!
                  </p>
                </div>
              )}

              {/* Render Comments */}
              {token &&
                comments.map((comment, index) => (
                  <CommentItem
                    key={comment._id || index}
                    comment={comment}
                    postId={post._id}
                    token={token}
                    currentUserId={currentUserId}
                    onReplyClick={handleReplyClick}
                  />
                ))}

              {hasNextPage && (
                <button
                  type="button"
                  disabled={isFetchingNextPage}
                  onClick={() => void fetchNextPage()}
                  className="mt-6 w-full rounded-xl border-2 border-dashed border-gray-200 bg-transparent px-4 py-3 text-sm font-bold text-gray-500 transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-50"
                >
                  {isFetchingNextPage ? "Loading more..." : "Load more comments"}
                </button>
              )}
            </div>

            {/* Fixed Comment Input */}
            <form
              onSubmit={handleSubmit}
              className="shrink-0 bg-white p-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-10"
            >
              {replyingTo && (
                <div className="mb-2 flex items-center justify-between rounded-xl bg-blue-50 px-3 py-1.5 text-xs text-blue-700">
                  <span>
                    Replying to <strong>{replyingTo}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    aria-label="Cancel reply"
                    className="font-semibold hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="relative flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder={
                    token
                      ? "Write a comment or reply..."
                      : "Log in to join the conversation"
                  }
                  aria-label="Write a comment"
                  disabled={!token || addCommentMutation.isPending}
                  className="min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50/50 px-5 py-3.5 pr-14 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={
                    !content.trim() || !token || addCommentMutation.isPending
                  }
                  className="absolute right-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                >
                  {addCommentMutation.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <FaPaperPlane className="ml-[-2px] text-sm" />
                  )}
                </button>
              </div>

              {addCommentMutation.isError && (
                <p role="alert" className="mt-2 px-2 text-xs text-red-500">
                  Couldn't post your comment. Please try again.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
