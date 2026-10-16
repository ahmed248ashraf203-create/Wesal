import type { Post } from "../types/post";

export const posts: Post[] = [
  {
    _id: "6acd2fe019a03414822f82fe",
    body: "Inventore at fuga E",
    privacy: "public",

    user: {
      _id: "6abfecb28ebe92c2c0de06eb",
      name: "Basem",
      username: "luffykuzan",
      photo:
        "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linked-posts/1790970512010-0a929cce-85b4-4adf-aac1-26d71cae00a4-One-Piece-Episode-721.mp4_snapshot_10.15_-2017.08.14_01.17.03-.webp",
    },

    sharedPost: null,
    likes: [],
    createdAt: "2026-10-12T19:07:12.866Z",
    commentsCount: 2,
    sharesCount: 0,
    likesCount: 0,
    isShare: false,
    bookmarked: false,

    topComment: {
      _id: "6acd302b19a03414822f8716",
      content: "wow",
      commentCreator: {
        _id: "6ac64b480bbe45cf7a095763",
        name: "ahmed",
        username: "sattar24",
        photo:
          "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linked-posts/1791832196841-aa92427c-0939-44d4-b6fb-657f3b667f94-download.webp",
      },
    },
  },
];
