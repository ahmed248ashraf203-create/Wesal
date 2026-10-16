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
  privacy: string;
  user: PostUser;
  sharedPost: Post | null;
  likes: unknown[];
  createdAt: string;
  commentsCount: number;
  sharesCount: number;
  likesCount: number;
  isShare: boolean;
  bookmarked: boolean;
  topComment: PostComment | null;
}
