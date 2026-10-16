import {
  FaGlobe,
  FaEllipsis,
  FaHeart,
  FaRegComment,
  FaShare,
  FaBookmark,
} from "react-icons/fa6";

import type { Post } from "../../types/post";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const {
    user,
    body,
    createdAt,
    likesCount,
    commentsCount,
    sharesCount,
    topComment,
  } = post;

  const postImage =
    (post as Post & { image?: string; imageUrl?: string }).image ??
    (post as Post & { imageUrl?: string }).imageUrl;

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* User Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={user.photo || "/default-avatar.png"}
            alt={user.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/default-avatar.png";
            }}
            className="h-12 w-12 shrink-0 rounded-full border border-gray-100 object-cover"
          />

          <div className="min-w-0">
            <h3 className="font-bold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">@{user.username}</p>

            <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
              <FaGlobe />
              {new Date(createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="More options"
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
        >
          <FaEllipsis />
        </button>
      </div>

      {/* Post Text */}
      <p className="my-5 whitespace-pre-wrap break-words text-gray-800">
        {body}
      </p>

      {/* Post Image */}
      {postImage && (
        <img
          src={postImage}
          alt="Post attachment"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="mb-4 max-h-[500px] w-full rounded-xl border border-gray-100 object-contain"
        />
      )}

      {/* Shared Post */}
      {post.sharedPost && (
        <div className="mb-4 rounded-xl border border-gray-200 p-4">
          {post.sharedPost.body}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500"
        >
          <FaHeart />
          {likesCount}
        </button>

        <button
          type="button"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
        >
          <FaRegComment />
          {commentsCount} Comments
        </button>

        <button
          type="button"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
        >
          <FaShare />
          {sharesCount} Shares
        </button>

        <button
          type="button"
          aria-label="Save post"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        >
          <FaBookmark />
        </button>
      </div>

      {/* Top Comment */}
      {topComment && (
        <div className="mt-4 rounded-xl bg-gray-50 p-3">
          <p className="mb-1 text-xs font-semibold text-gray-500">
            Top comment
          </p>

          <p className="text-sm text-gray-700">
            <span className="font-semibold">
              {topComment.commentCreator.name}
            </span>
            : {topComment.content}
          </p>
        </div>
      )}
    </article>
  );
}
