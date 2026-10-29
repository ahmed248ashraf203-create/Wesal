import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  user?: string | { _id?: string; id?: string };
  id?: string;
  _id?: string;
  userId?: string;
}

/** Single shared implementation: handles {user:"id"}, {user:{_id}}, {id}, ... */
export function getUserIdFromToken(token?: string | null): string | null {
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    const userId =
      typeof decoded.user === "string"
        ? decoded.user
        : (decoded.user?._id ?? decoded.user?.id);

    const id = userId ?? decoded.id ?? decoded._id ?? decoded.userId;

    return typeof id === "string" ? id : null;
  } catch {
    return null;
  }
}
