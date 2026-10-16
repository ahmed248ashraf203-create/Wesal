import { useContext } from "react";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthencreatedContext } from "../../context/AuthenContext";

type ProtectedRoutProps = {
  children: ReactNode;
};

export default function ProtectedRout({ children }: ProtectedRoutProps) {
  const { token } = useContext(AuthencreatedContext);

  if (!token) {
    return <Navigate to={"/login"} replace />;
  }

  return <>{children}</>;
}
