import { useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import Seo from "../../components/Seo/Seo";
import { timeAgo, fullDate } from "../../lib/time";
import ModalShell from "../../components/Modal/ModalShell";
import { handleAvatarError } from "../../lib/avatar";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaXmark,
  FaHeart,
  FaComment,
  FaUserPlus,
  FaRotateRight,
} from "react-icons/fa6";

import { AuthencreatedContext } from "../../context/AuthenContext";
import axios from "axios";
interface NotificationItem {
  _id: string;
  actor?: {
    _id?: string;
    name?: string;
    photo?: string;
  };
  type: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
  entity?: {
    _id?: string;
    id?: string;
    body?: string;
    image?: string;
    user?: string;
    likesCount?: number;
    commentsCount?: number;
    sharesCount?: number;
    unavailable?: boolean;
  };
}

interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: NotificationItem[];
  };
  meta?: {
    pagination?: {
      currentPage: number;
      limit: number;
      total: number;
      numberOfPages: number;
    };
  };
}

function getNotificationMessage(notification: NotificationItem) {
  const name = notification.actor?.name ?? "Someone";

  switch (notification.type) {
    case "like_post":
      return `${name} liked your post`;
    case "comment_post":
      return `${name} commented on your post`;
    case "follow_user":
      return `${name} started following you`;
    default:
      return `${name} sent you a notification`;
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "like_post":
      return <FaHeart />;
    case "comment_post":
      return <FaComment />;
    case "follow_user":
      return <FaUserPlus />;
    default:
      return <FaBell />;
  }
}

export default function Notifications() {
  const authContext = useContext(AuthencreatedContext);
  const token = authContext?.token;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);

  const limit = 10;

  // Get notifications
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["notifications", token, filter, page, limit],
    queryFn: async () => {
      if (!token) {
        throw new Error("You are not authenticated.");
      }

      const response = await api.get<NotificationsResponse>("/notifications", {
        params: {
          unread: filter === "unread",
          page,
          limit,
        },
      });

      return response.data;
    },
    enabled: Boolean(token),
    staleTime: 30_000,
  });

  // Same query the Navbar badge uses, so both always agree.
  const unreadCount = useUnreadCount();

  const notifications = data?.data?.notifications ?? [];
  const pagination = data?.meta?.pagination;
  const totalPages = pagination?.numberOfPages ?? 1;

  const refreshNotifications = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["notifications", token],
      }),
      queryClient.invalidateQueries({
        queryKey: ["unreadNotificationCount", token],
      }),
    ]);
  };

  // Mark one notification as read
  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.patch(`/notifications/${notificationId}/read`);

      return response.data;
    },
    onSuccess: refreshNotifications,
  });

  // Mark all notifications as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch("/notifications/read-all");

      return response.data;
    },
    onSuccess: async () => {
      await refreshNotifications();
    },
  });

  const handleNotificationClick = async (notification: NotificationItem) => {
    // Open the notification details immediately.
    setSelectedNotification(notification);

    // Mark it as read if it is unread.
    if (!notification.isRead) {
      markReadMutation.mutate(notification._id);
    }
  };

  const handleFilterChange = (value: "all" | "unread") => {
    setFilter(value);
    setPage(1);
  };

  const handleOpenPost = () => {
    if (!selectedNotification) return;

    const notification = selectedNotification;

    if (notification.entityType !== "post") {
      setSelectedNotification(null);
      return;
    }

    if (notification.entity?.unavailable) {
      return;
    }

    const postId =
      notification.entity?._id ??
      notification.entity?.id ??
      notification.entityId;

    if (!postId) return;

    setSelectedNotification(null);

    // Navigate to Home with the post ID.
    // Home must handle this query parameter to scroll to/open the post.
    navigate(`/home?post=${encodeURIComponent(postId)}`);
  };

  return (
    <div className="min-h-dvh bg-gray-50/50 pb-12 dark:bg-gray-950">
      <Seo
        title={
          unreadCount > 0 ? `(${unreadCount}) Notifications` : "Notifications"
        }
        description="Your latest activity on Wesal."
        noIndex
      />
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Notifications
              </h1>

              <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                Stay updated with likes, comments, and new followers.
              </p>

              <p className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                {unreadCount} unread notifications
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <FaRotateRight className={isFetching ? "animate-spin" : ""} />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending || unreadCount === 0}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaCheckDouble />
                {markAllReadMutation.isPending
                  ? "Updating..."
                  : "Mark all as read"}
              </button>
            </div>
          </div>

          {markAllReadMutation.isError && (
            <p className="mt-4 text-sm text-red-500">
              {axios.isAxiosError(markAllReadMutation.error)
                ? (markAllReadMutation.error.response?.data?.message ??
                  "Failed to mark all notifications as read.")
                : "Failed to update notifications."}
            </p>
          )}

          {/* Filters */}
          <div className="mt-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleFilterChange("all")}
              className={`rounded-full px-5 py-2 text-xs font-bold transition ${
                filter === "all"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange("unread")}
              className={`rounded-full px-5 py-2 text-xs font-bold transition ${
                filter === "unread"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              Unread
            </button>
          </div>

          {/* Notifications list */}
          <div className="mt-6 min-h-[250px] rounded-2xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-950/50 sm:p-6">
            {isLoading ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Loading notifications...
                </p>
              </div>
            ) : isError ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm text-red-500">
                  {axios.isAxiosError(error)
                    ? (error.response?.data?.message ??
                      "Failed to load notifications.")
                    : error instanceof Error
                      ? error.message
                      : "Something went wrong."}
                </p>

                <button
                  type="button"
                  onClick={() => refetch()}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const actorName = notification.actor?.name ?? "Someone";

                  return (
                    <button
                      type="button"
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition hover:border-blue-200 hover:shadow-sm dark:hover:border-blue-800 ${
                        notification.isRead
                          ? "border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"
                          : "border-blue-100 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/30"
                      }`}
                    >
                      {notification.actor?.photo ? (
                        <img
                          src={notification.actor.photo}
                          onError={handleAvatarError}
                          alt={actorName}
                          className="h-11 w-11 shrink-0 rounded-full border border-gray-100 object-cover dark:border-gray-700"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
                          <FaBell />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 dark:text-blue-400">
                            {getNotificationIcon(notification.type)}
                          </span>

                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                            {getNotificationMessage(notification)}
                          </p>
                        </div>

                        {notification.entity?.body && (
                          <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                            {notification.entity.body}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-gray-400">
                          <time
                            dateTime={notification.createdAt}
                            title={fullDate(notification.createdAt)}
                          >
                            {timeAgo(notification.createdAt)}
                          </time>
                        </p>
                      </div>

                      {!notification.isRead && (
                        <span
                          className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600"
                          title="Unread"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
                  <FaBell className="text-xl" />
                </div>

                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {filter === "unread"
                    ? "You have no unread notifications."
                    : "No notifications yet."}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && !isError && notifications.length > 0 && (
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Page {pagination?.currentPage ?? page} of {totalPages}
                {pagination && ` • ${pagination.total} notifications`}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification / Post Details Modal */}
      {selectedNotification && (
        <ModalShell
          labelledBy="notification-details-title"
          onClose={() => setSelectedNotification(null)}
          className="max-h-[85dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-900 sm:p-6"
        >
          <>
            <div className="mb-5 flex items-center justify-between">
              <h2
                id="notification-details-title"
                className="text-lg font-bold text-gray-900 dark:text-white"
              >
                Notification details
              </h2>

              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <FaXmark />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {selectedNotification.actor?.photo ? (
                <img
                  src={selectedNotification.actor.photo}
                  onError={handleAvatarError}
                  alt={selectedNotification.actor.name ?? "User"}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <FaBell />
                </div>
              )}

              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {getNotificationMessage(selectedNotification)}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {fullDate(selectedNotification.createdAt)}
                </p>
              </div>
            </div>

            {selectedNotification.entityType === "post" ? (
              selectedNotification.entity?.unavailable ? (
                <div className="mt-5 rounded-xl bg-gray-50 p-5 text-center dark:bg-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    This post is no longer available.
                  </p>
                </div>
              ) : (
                <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                  {selectedNotification.entity?.body && (
                    <p className="whitespace-pre-wrap p-4 text-sm text-gray-800 dark:text-gray-100">
                      {selectedNotification.entity.body}
                    </p>
                  )}

                  {selectedNotification.entity?.image && (
                    <img
                      src={selectedNotification.entity.image}
                      alt="Post attachment"
                      className="max-h-[350px] w-full object-contain"
                    />
                  )}

                  {!selectedNotification.entity?.body &&
                    !selectedNotification.entity?.image && (
                      <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
                        Post details are not included in this notification.
                      </p>
                    )}

                  <div className="flex flex-wrap gap-4 border-t border-gray-100 px-4 py-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    <span>
                      {selectedNotification.entity?.likesCount ?? 0} likes
                    </span>
                    <span>
                      {selectedNotification.entity?.commentsCount ?? 0} comments
                    </span>
                    <span>
                      {selectedNotification.entity?.sharesCount ?? 0} shares
                    </span>
                  </div>

                  <div className="border-t border-gray-100 p-4 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={handleOpenPost}
                      className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      Open post in feed
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="mt-5 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  {selectedNotification.entityType === "user"
                    ? "This notification is about a user follow."
                    : "No post is attached to this notification."}
                </p>
              </div>
            )}

            {markReadMutation.isError && (
              <p className="mt-4 text-sm text-red-500">
                Failed to mark notification as read. Please try again.
              </p>
            )}

            {!selectedNotification.isRead && !markReadMutation.isPending && (
              <button
                type="button"
                onClick={() =>
                  markReadMutation.mutate(selectedNotification._id)
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <FaCheck />
                Mark as read
              </button>
            )}

            {markReadMutation.isPending && (
              <p className="mt-3 text-center text-xs text-gray-500">
                Updating notification...
              </p>
            )}
          </>
        </ModalShell>
      )}
    </div>
  );
}
