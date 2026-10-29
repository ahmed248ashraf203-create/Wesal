import type { SyntheticEvent } from "react";

/**
 * Inline SVG avatar. Because it is a data URI there is no file to forget in
 * /public, no network request, and therefore no onError loop.
 */
export const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#e0e7ff"/>
      <circle cx="32" cy="25" r="11" fill="#818cf8"/>
      <path d="M10 60c2-14 12-21 22-21s20 7 22 21z" fill="#818cf8"/>
    </svg>`,
  );

/**
 * onError handler that swaps in the fallback exactly once. If the fallback
 * itself fails, we stop instead of retrying forever.
 */
export function handleAvatarError(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  img.onerror = null;

  if (img.src !== DEFAULT_AVATAR) {
    img.src = DEFAULT_AVATAR;
  }
}
