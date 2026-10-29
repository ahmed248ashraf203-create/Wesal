import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "../lib/api";

/**
 * PUT /users/:id/follow  (toggles follow / unfollow)
 *
 * Keeps a small map of optimistic values so a list of users can share one hook.
 */
export function useFollow() {
  const queryClient = useQueryClient();
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async ({ id }: { id: string; next: boolean }) => {
      const { data } = await api.put(`/users/${id}/follow`);
      return data;
    },

    onMutate: ({ id, next }) => {
      setError("");
      setOverrides((cur) => ({ ...cur, [id]: next }));
      setPending((cur) => ({ ...cur, [id]: true }));
    },

    onSuccess: (data, { id }) => {
      const returned = data?.data?.following ?? data?.following;
      if (typeof returned === "boolean") {
        setOverrides((cur) => ({ ...cur, [id]: returned }));
      }
    },

    onError: (err, { id, next }) => {
      // roll back to the value before the click
      setOverrides((cur) => ({ ...cur, [id]: !next }));
      setError(getErrorMessage(err, "Couldn't update follow status."));
    },

    onSettled: async (_data, _err, { id }) => {
      setPending((cur) => ({ ...cur, [id]: false }));

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
        queryClient.invalidateQueries({ queryKey: ["publicProfile", id] }),
      ]);
    },
  });

  return {
    error,
    isFollowing: (id: string, initial = false) => overrides[id] ?? initial,
    isPending: (id: string) => Boolean(pending[id]),
    toggle: (id: string, initial = false) => {
      if (pending[id]) return;
      const current = overrides[id] ?? initial;
      mutation.mutate({ id, next: !current });
    },
  };
}
