import axios from "axios";

export const BASE_URL = "https://route-posts.routemisr.com";

export const TOKEN_KEY = "token";
export const UNAUTHORIZED_EVENT = "wesal:unauthorized";

/**
 * One axios instance for the whole app.
 *
 * - baseURL is defined once.
 * - The token is read from localStorage on every request, so components no
 *   longer pass headers by hand (and can't forget to).
 * - Both `token` and `Authorization: Bearer` are sent, because the older
 *   endpoints in this project used `token` and the newer ones use Bearer.
 * - A 401 anywhere clears the session (see AuthenContext).
 */
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20_000,
});

api.interceptors.request.use((config) => {
  let token: string | null = null;

  try {
    token = localStorage.getItem(TOKEN_KEY);
  } catch {
    token = null;
  }

  if (token) {
    config.headers.set("token", token);
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error?.config?.url ?? "";
    const isAuthRequest =
      url.includes("/users/signin") || url.includes("/users/signup");

    if (error?.response?.status === 401 && !isAuthRequest) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    return Promise.reject(error);
  },
);

/** Pulls a readable message out of any axios / unknown error. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? fallback;
  }

  return error instanceof Error ? error.message : fallback;
}
