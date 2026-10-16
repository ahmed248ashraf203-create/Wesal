import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

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

export default function AuthenContext({ children }: AuthContextProps) {
  const [token, settoken] = useState<string | null>(function () {
    return localStorage.getItem("token");
  });

  function addsetToken(tkn: string) {
    settoken(tkn);
    localStorage.setItem("token", tkn);
  }
  function removesetToken() {
    settoken(null);
    localStorage.removeItemItem("token");
  }

  return (
    <AuthencreatedContext.Provider
      value={{ token, settoken, addsetToken, removesetToken }}
    >
      {children}
    </AuthencreatedContext.Provider>
  );
}
