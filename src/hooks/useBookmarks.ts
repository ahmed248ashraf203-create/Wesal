import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { AuthencreatedContext } from "../context/AuthenContext";
import { extractPosts } from "../types/post";

/** GET /users/bookmarks */
export function useBookmarks(enabled = true) {
  const { token } = useContext(AuthencreatedContext);

  return useQuery({
    queryKey: ["bookmarks", token],
    queryFn: async () => {
      const response = await api.get("/users/bookmarks");

      // Anything returned by the bookmarks endpoint is, by definition, saved.
      return extractPosts(response.data).map((post) => ({
        ...post,
        bookmarked: true,
      }));
    },
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
    retry: 1,
  });
}
