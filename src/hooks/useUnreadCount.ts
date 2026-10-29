import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { AuthencreatedContext } from "../context/AuthenContext";

interface UnreadCountResponse {
  data?: { unreadCount?: number; count?: number };
  unreadCount?: number;
  count?: number;
}

/** Shared by the Navbar badge, the mobile bar and the Notifications page. */
export function useUnreadCount() {
  const { token } = useContext(AuthencreatedContext);

  const { data } = useQuery({
    queryKey: ["unreadNotificationCount", token],
    queryFn: async () => {
      const response = await api.get<UnreadCountResponse>(
        "/notifications/unread-count",
      );
      return response.data;
    },
    enabled: Boolean(token),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  return (
    data?.data?.unreadCount ??
    data?.data?.count ??
    data?.unreadCount ??
    data?.count ??
    0
  );
}
