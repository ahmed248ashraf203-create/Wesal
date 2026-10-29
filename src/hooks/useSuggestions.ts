import { useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { AuthencreatedContext } from "../context/AuthenContext";

export interface Friend {
  _id: string;
  name: string;
  username?: string;
  photo?: string;
  followersCount?: number;
  followers?: number | string[];
  isFollowing?: boolean;
}

/** GET /users/suggestions : shared by the sidebar widget and Community page. */
export function useSuggestions(limit = 10) {
  const { token } = useContext(AuthencreatedContext);

  const query = useQuery({
    queryKey: ["suggestedFriends", token, limit],
    queryFn: async () => {
      const response = await api.get("/users/suggestions", {
        params: { limit },
      });
      return response.data;
    },
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Supports the common API response shapes.
  const friends: Friend[] = useMemo(() => {
    const result = query.data?.data;

    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.suggestions)) return result.suggestions;
    if (Array.isArray(result?.users)) return result.users;

    return [];
  }, [query.data]);

  return { ...query, friends };
}
