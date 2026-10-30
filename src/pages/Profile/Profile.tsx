import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FaRegEnvelope,
  FaCircleCheck,
  FaRegFileLines,
  FaBookmark,
  FaUsers,
  FaUserPlus,
  FaCamera,
  FaImage,
  FaAt,
  FaCircleExclamation,
  FaRotateRight,
  FaCheck,
} from "react-icons/fa6";

import { AuthencreatedContext } from "../../context/AuthenContext";
import type { Post } from "../../types/post";
import PageError from "../PageError/PageError";
import ProfileSkeleton from "../../components/ProfileSkeleton/ProfileSkeleton";
import PostCard from "../../components/PostCard/PostCard";
import CreatePost from "../../components/CreatePost/CreatePost";
import Seo from "../../components/Seo/Seo";

import { getUserIdFromToken } from "../../components/PostCard/Getuseridfromtoken";
import ProfileImageModal from "./Profileimagemodal";
import type { ImageKind } from "./Profileimagemodal";
import { api, getErrorMessage } from "../../lib/api";
import { DEFAULT_AVATAR, handleAvatarError } from "../../lib/avatar";
import { useBookmarks } from "../../hooks/useBookmarks";
import { useFollow } from "../../hooks/useFollow";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type ProfileUser = {
  _id?: string;
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  photo?: string;
  cover?: string;
  coverImage?: string;
  coverPhoto?: string;
  followersCount?: number;
  followingCount?: number;
  bookmarksCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  user?: T;
  posts?: T[];
  data?: T | T[] | { user?: T; posts?: T[] };
};

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

function getPostsFromResponse(response: ApiResponse<Post> | Post[]): Post[] {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response.posts)) {
    return response.posts;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data && !Array.isArray(response.data)) {
    if ("posts" in response.data && Array.isArray(response.data.posts)) {
      return response.data.posts;
    }
  }

  return [];
}

export default function Profile() {
  const { token } = useContext(AuthencreatedContext);
  const queryClient = useQueryClient();

  // /profile        -> my own profile
  // /profile/:id    -> someone else's profile (or mine, if the id is mine)
  const { id: routeId } = useParams<{ id: string }>();
  const myId = getUserIdFromToken(token);
  const isOwnProfile = !routeId || routeId === myId;
  const follow = useFollow();

  const [activeTab, setActiveTab] = useState<"myPosts" | "saved">("myPosts");

  const [pendingImage, setPendingImage] = useState<{
    kind: ImageKind;
    file: File;
  } | null>(null);

  const [toast, setToast] = useState<ToastState>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------
  // Profile data
  // GET /users/profile-data
  // ---------------------------------------------------------

  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery<ProfileUser>({
    // Own profile shares the Navbar's cache entry; other users get their own.
    queryKey: isOwnProfile ? ["userProfile", token] : ["publicProfile", routeId],

    queryFn: async () => {
      const response = await api.get<ApiResponse<ProfileUser>>(
        isOwnProfile ? "/users/profile-data" : `/users/${routeId}/profile`,
      );

      const result = response.data;

      if (result?.user) {
        return result.user;
      }

      if (result?.data && !Array.isArray(result.data)) {
        if ("user" in result.data && result.data.user) {
          return result.data.user;
        }

        return result.data as ProfileUser;
      }

      return result as ProfileUser;
    },

    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
  });

  const user: ProfileUser = profileData ?? {};

  const userId = isOwnProfile
    ? (user._id ?? user.id ?? myId)
    : (routeId ?? user._id ?? user.id ?? null);

  // ---------------------------------------------------------
  // User posts
  // GET /users/:id/posts
  // ---------------------------------------------------------

  const {
    data: userPostsData,
    isLoading: isPostsLoading,
    isError: isPostsError,
    isFetching: isPostsFetching,
    refetch: refetchPosts,
  } = useQuery<Post[]>({
    queryKey: ["userPosts", userId, token],

    queryFn: async () => {
      if (!userId) return [];

      const response = await api.get<ApiResponse<Post> | Post[]>(
        `/users/${userId}/posts`,
      );

      return getPostsFromResponse(response.data);
    },

    enabled: Boolean(token && userId),
  });

  const userPosts = Array.isArray(userPostsData) ? userPostsData : [];

  // ---------------------------------------------------------
  // Create post
  // POST /posts
  // ---------------------------------------------------------

  const createPostMutation = useMutation({
    mutationFn: async ({ body, image }: { body: string; image?: File }) => {
      if (!token) {
        throw new Error("You must be logged in to create a post.");
      }

      // multipart/form-data, so the image is actually uploaded.
      // (It used to send JSON { body } and silently drop the photo.)
      const formData = new FormData();
      if (body) formData.append("body", body);
      if (image) formData.append("image", image);

      const response = await api.post("/posts", formData);

      return response.data;
    },

    onSuccess: async () => {
      setToast({
        type: "success",
        message: "Post created successfully!",
      });

      // تحديث بوستات البروفايل والـ Feed
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["userPosts", userId, token],
        }),
        queryClient.invalidateQueries({
          queryKey: ["allPosts", token],
        }),
      ]);

      // تحديث بيانات البروفايل، ومنها عدد البوستات
      await queryClient.invalidateQueries({
        queryKey: ["userProfile", token],
      });
    },

    onError: (error) => {
      setToast({
        type: "error",
        message: getErrorMessage(
          error,
          "Failed to create post. Please try again.",
        ),
      });
    },
  });

  const handleCreatePost = async (
    body: string,
    image?: File,
  ): Promise<boolean> => {
    if (!token || (!body.trim() && !image) || createPostMutation.isPending) {
      return false;
    }

    try {
      await createPostMutation.mutateAsync({ body: body.trim(), image });
      return true;
    } catch {
      return false;
    }
  };

  // ---------------------------------------------------------
  // Saved posts (own profile only)
  // GET /users/bookmarks
  // ---------------------------------------------------------

  const {
    data: savedPosts = [],
    isLoading: isSavedLoading,
    isError: isSavedError,
    refetch: refetchSaved,
  } = useBookmarks(isOwnProfile && activeTab === "saved");

  // ---------------------------------------------------------
  // Toast
  // ---------------------------------------------------------

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  // ---------------------------------------------------------
  // Profile display data
  // ---------------------------------------------------------

  const displayName = user.name || "Wesal Member";
  const username = user.username || user.email?.split("@")[0] || "member";

  const avatar = user.photo || DEFAULT_AVATAR;
  const cover = user.cover ?? user.coverImage ?? user.coverPhoto;

  const stats = [
    {
      icon: <FaRegFileLines />,
      label: "Posts",
      value: user.postsCount ?? userPosts.length,
    },
    {
      icon: <FaUsers />,
      label: "Followers",
      value: user.followersCount ?? 0,
    },
    {
      icon: <FaUserPlus />,
      label: "Following",
      value: user.followingCount ?? 0,
    },
    ...(isOwnProfile
      ? [
          {
            icon: <FaBookmark />,
            label: "Bookmarks",
            value: user.bookmarksCount ?? savedPosts.length,
          },
        ]
      : []),
  ];

  const formatCount = (count: number) =>
    new Intl.NumberFormat("en-US").format(count);

  // ---------------------------------------------------------
  // Upload profile / cover image
  // ---------------------------------------------------------

  const handleFileChange =
    (kind: ImageKind) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      // يسمح باختيار نفس الصورة مرة أخرى
      event.target.value = "";

      if (!file) return;

      if (!ALLOWED_TYPES.includes(file.type)) {
        setToast({
          type: "error",
          message: "Please choose a JPG, PNG, WEBP or GIF image.",
        });
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setToast({
          type: "error",
          message: "Image is too large. The maximum size is 5 MB.",
        });
        return;
      }

      setPendingImage({ kind, file });
    };

  const handleUploadSuccess = (kind: ImageKind) => {
    setPendingImage(null);

    setToast({
      type: "success",
      message:
        kind === "photo"
          ? "Profile photo updated successfully."
          : "Cover photo updated successfully.",
    });

    queryClient.invalidateQueries({
      queryKey: ["userProfile", token],
    });
  };

  // ---------------------------------------------------------
  // Authentication / loading / error
  // ---------------------------------------------------------

  if (!token) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <FaUsers size={28} />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            Sign in to view your profile
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Log in to see your profile information and posts on Wesal.
          </p>
        </div>
      </div>
    );
  }

  if (isProfileLoading) {
    return <ProfileSkeleton />;
  }

  if (isProfileError) {
    return <PageError />;
  }

  const userIsFollowed = follow.isFollowing(
    String(userId ?? ""),
    Boolean(user.isFollowing),
  );

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <Seo
        title={isOwnProfile ? "My profile" : displayName}
        description={`${displayName} (@${username}) on Wesal.`}
        noIndex
      />

      <div className="mx-auto max-w-6xl">
        {/* ===================== Header card ===================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Cover */}

          <div className="group/cover relative h-44 overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-600 sm:h-60 lg:h-72">
            {cover && (
              <img
                src={cover}
                alt="Cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

            {!cover && (
              <div className="absolute bottom-5 left-6 text-white sm:left-8">
                <p className="text-sm font-medium text-white/80">
                  {isOwnProfile ? "Welcome to your space" : "Wesal profile"}
                </p>

                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                  {isOwnProfile ? "My Profile" : displayName}
                </h1>
              </div>
            )}

            {isOwnProfile && (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-lg backdrop-blur transition-all hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/70 sm:bottom-5 sm:right-5"
            >
              <FaImage className="text-blue-600" />

              <span className="hidden sm:inline">
                {cover ? "Change cover" : "Add cover photo"}
              </span>

              <span className="sm:hidden">Cover</span>
            </button>
            )}

            {isOwnProfile && (
            <input
              ref={coverInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              onChange={handleFileChange("cover")}
              className="hidden"
              aria-label="Upload cover photo"
            />
            )}
          </div>

          {/* Identity */}

          <div className="px-5 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
              {/* Avatar */}

              <div className="relative z-10 -mt-16 w-fit shrink-0 sm:-mt-20">
                <img
                  src={avatar}
                  alt={displayName}
                  onError={handleAvatarError}
                  className="h-32 w-32 rounded-full border-4 border-white bg-white object-cover shadow-xl sm:h-40 sm:w-40"
                />

                {isOwnProfile && (
                  <>
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      aria-label="Change profile photo"
                      className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ring-4 ring-white transition-all hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-blue-200"
                    >
                      <FaCamera size={16} />
                    </button>

                    <input
                      ref={photoInputRef}
                      type="file"
                      accept={ALLOWED_TYPES.join(",")}
                      onChange={handleFileChange("photo")}
                      className="hidden"
                      aria-label="Upload profile photo"
                    />
                  </>
                )}
              </div>

              <div className="min-w-0 flex-1 pb-1 sm:pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    {displayName}
                  </h2>

                  <FaCircleCheck
                    className="shrink-0 text-blue-600"
                    title="Wesal member"
                  />
                </div>

                <p className="mt-0.5 text-sm font-medium text-slate-500">
                  @{username}
                </p>
              </div>

              {isOwnProfile ? (
                <div className="flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-semibold text-emerald-700 sm:mb-4 sm:self-end">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Member on Wesal
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    follow.toggle(String(userId), Boolean(user.isFollowing))
                  }
                  disabled={!userId || follow.isPending(String(userId))}
                  aria-pressed={userIsFollowed}
                  className={`flex items-center gap-2 self-start rounded-full px-5 py-2 text-sm font-semibold transition disabled:opacity-60 sm:mb-4 sm:self-end ${
                    userIsFollowed
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {userIsFollowed ? <FaCheck /> : <FaUserPlus />}
                  {userIsFollowed ? "Following" : "Follow"}
                </button>
              )}
            </div>

            {/* Stats */}

            <dl className="mt-6 grid grid-cols-2 divide-slate-100 border-t border-slate-100 sm:grid-cols-4 sm:divide-x">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center py-5 text-center"
                >
                  <dd className="text-2xl font-extrabold text-slate-900">
                    {formatCount(stat.value)}
                  </dd>

                  <dt className="mt-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <span className="text-blue-600">{stat.icon}</span>
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ===================== Content ===================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Sidebar */}

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">About</h3>

              <ul className="mt-4 space-y-4 text-sm">
                <li className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FaAt />
                  </span>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">
                      Username
                    </p>

                    <p className="truncate font-semibold text-slate-800">
                      @{username}
                    </p>
                  </div>
                </li>

                {user.email && (
                  <li className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FaRegEnvelope />
                    </span>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-400">
                        Email
                      </p>

                      <p className="break-all font-semibold text-slate-800">
                        {user.email}
                      </p>
                    </div>
                  </li>
                )}
              </ul>
            </section>
          </aside>

          {/* Posts */}

          <section id="profile-content" className="min-w-0">
            <div
              role="tablist"
              aria-label="Profile content"
              className="inline-flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-200"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "myPosts"}
                onClick={() => setActiveTab("myPosts")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === "myPosts"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <FaRegFileLines />
                {isOwnProfile ? "My Posts" : "Posts"}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    activeTab === "myPosts"
                      ? "bg-white/20"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {userPosts.length}
                </span>
              </button>

              {isOwnProfile && (
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "saved"}
                onClick={() => setActiveTab("saved")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === "saved"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <FaBookmark />
                Saved Posts
              </button>
              )}
            </div>

            <div className="pt-5">
              {isOwnProfile && activeTab === "saved" ? (
                isSavedLoading ? (
                  <PostsSkeleton />
                ) : isSavedError ? (
                  <div
                    role="alert"
                    className="rounded-3xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm"
                  >
                    <p className="text-sm text-slate-600">
                      Couldn't load your saved posts.
                    </p>
                    <button
                      type="button"
                      onClick={() => refetchSaved()}
                      className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Try again
                    </button>
                  </div>
                ) : savedPosts.length > 0 ? (
                  <div className="space-y-5">
                    {savedPosts.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No saved posts"
                    description="Tap the bookmark icon on any post to keep it here."
                    icon={<FaBookmark size={24} />}
                  />
                )
              ) : (
                <>
                  {/* Create Post component (own profile only) */}

                  {isOwnProfile && (
                    <div className="mb-5">
                      <CreatePost onCreatePost={handleCreatePost} />
                    </div>
                  )}

                  {/* Loading posts */}

                  {isPostsLoading ? (
                    <PostsSkeleton />
                  ) : isPostsError ? (
                    <div
                      role="alert"
                      className="rounded-3xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm"
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <FaCircleExclamation size={24} />
                      </div>

                      <h3 className="mt-4 text-lg font-bold text-slate-900">
                        Couldn't load posts
                      </h3>

                      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                        Please check your connection and try again.
                      </p>

                      <button
                        type="button"
                        onClick={() => refetchPosts()}
                        disabled={isPostsFetching}
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                      >
                        <FaRotateRight
                          className={isPostsFetching ? "animate-spin" : ""}
                        />

                        {isPostsFetching ? "Retrying..." : "Try again"}
                      </button>
                    </div>
                  ) : userPosts.length > 0 ? (
                    <div className="space-y-5">
                      {userPosts.map((post) => (
                        <PostCard key={post._id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No posts yet"
                      description={
                        isOwnProfile
                          ? "Your posts will appear here when you start sharing."
                          : "This user hasn't posted anything yet."
                      }
                      icon={<FaRegFileLines size={24} />}
                    />
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Upload modal */}

      {pendingImage && (
        <ProfileImageModal
          kind={pendingImage.kind}
          file={pendingImage.file}
          onClose={() => setPendingImage(null)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Toast */}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-20 left-1/2 z-[80] flex w-max max-w-[90vw] -translate-x-1/2 items-center gap-2 rounded-full px-5 py-3 sm:bottom-6 text-sm font-semibold text-white shadow-xl ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <FaCircleCheck />
          ) : (
            <FaCircleExclamation />
          )}

          {toast.message}
        </div>
      )}
    </main>
  );
}

// ---------------------------------------------------------
// Posts skeleton
// ---------------------------------------------------------

function PostsSkeleton() {
  return (
    <div className="space-y-5">
      {[1, 2].map((n) => (
        <div
          key={n}
          className="animate-pulse rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-full bg-slate-200" />

            <div className="space-y-2">
              <div className="h-3.5 w-32 rounded bg-slate-200" />
              <div className="h-3 w-20 rounded bg-slate-100" />
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <div className="h-3.5 w-full rounded bg-slate-200" />
            <div className="h-3.5 w-4/5 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------
// Empty state
// ---------------------------------------------------------

type EmptyStateProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}
