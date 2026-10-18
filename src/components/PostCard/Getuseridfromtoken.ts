// بيطلع id المستخدم من الـ JWT token من غير أي request زيادة
export function getUserIdFromToken(token?: string | null): string | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return json.user ?? json.id ?? json._id ?? json.userId ?? null;
  } catch {
    return null;
  }
}
