export interface PostUser {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface PostComment {
  _id?: string;
  content: string;
  commentCreator: PostUser;
}

export interface Post {
  _id: string;
  id?: string;
  body: string;
  image?: string;
  imageUrl?: string;
  privacy: string;
  user: PostUser;
  sharedPost: Post | null;
  likes: Array<string | { _id?: string }>;
  isLiked?: boolean;
  createdAt: string;
  commentsCount: number;
  sharesCount: number;
  likesCount: number;
  isShare: boolean;
  bookmarked: boolean;
  topComment: PostComment | null;
}

/** Extracts the posts array from the different shapes the API returns. */
export function extractPosts(payload: unknown): Post[] {
  const p = payload as {
    data?: { posts?: Post[]; bookmarks?: Post[]; postsFeed?: Post[] } | Post[];
    posts?: Post[];
    bookmarks?: Post[];
  };

  if (Array.isArray(p?.data)) return p.data;

  const data = p?.data as
    | { posts?: Post[]; bookmarks?: Post[]; postsFeed?: Post[] }
    | undefined;

  return (
    data?.posts ??
    data?.bookmarks ??
    data?.postsFeed ??
    p?.posts ??
    p?.bookmarks ??
    []
  );
}

/** Reads "is there another page?" from the shapes used by this API. */
export function extractNextPage(payload: unknown): number | undefined {
  const p = payload as {
    data?: { paginationInfo?: { nextPage?: number | null } };
    meta?: { pagination?: { nextPage?: number | null } };
    paginationInfo?: { nextPage?: number | null };
  };

  const next =
    p?.data?.paginationInfo?.nextPage ??
    p?.meta?.pagination?.nextPage ??
    p?.paginationInfo?.nextPage;

  return typeof next === "number" ? next : undefined;
}
