import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TOKEN_KEY, UNAUTHORIZED_EVENT } from "../lib/api";

type AuthContextType = {
  token: string | null;

  settoken: (token: string) => void;
  addsetToken: (tkn: string) => void;
  removesetToken: () => void;
};

type AuthContextProps = {
  children: ReactNode;
};

export const AuthencreatedContext = createContext<AuthContextType>({
  token: null,
  settoken: () => {},
  addsetToken: () => {},
  removesetToken: () => {},
});

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export default function AuthenContext({ children }: AuthContextProps) {
  const queryClient = useQueryClient();
  const [token, settoken] = useState<string | null>(readToken);

  const addsetToken = useCallback((tkn: string) => {
    settoken(tkn);

    try {
      localStorage.setItem(TOKEN_KEY, tkn);
    } catch {
      // Storage unavailable: the session just won't survive a refresh.
    }
  }, []);

  const removesetToken = useCallback(() => {
    settoken(null);

    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }

    // Never leave the previous user's data in the cache.
    queryClient.clear();
  }, [queryClient]);

  // Any 401 from the API (expired token) logs the user out.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, removesetToken);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, removesetToken);
  }, [removesetToken]);

  // Keep several tabs in sync (logout in one tab = logout in all).
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === TOKEN_KEY) {
        settoken(event.newValue);
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({ token, settoken, addsetToken, removesetToken }),
    [token, addsetToken, removesetToken],
  );

  return (
    <AuthencreatedContext.Provider value={value}>
      {children}
    </AuthencreatedContext.Provider>
  );
}
