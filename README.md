# Wesal

Wesal is a social media web app built with React and TypeScript. Users can sign up, post text and images, like and comment, follow other people, save posts, and get notifications.

It talks to the Route Posts API: `https://route-posts.routemisr.com`

## Features

- **Auth:** sign up, log in, log out, change password. A 401 from the API logs the user out automatically.
- **Feed:** infinite scroll, create posts with an image, edit and delete your own posts.
- **Interactions:** like posts and comments, comment, reply (mention), share (copy link or native share sheet).
- **Saved posts:** bookmark / unbookmark a post, `/saved` page, and a Saved tab on your profile.
- **Follow:** follow / unfollow from Suggested Friends, the Community page, and other users' profiles.
- **Profiles:** your own profile (change photo and cover) and other users' profiles at `/profile/:id`.
- **Notifications:** list, filter unread, mark one or all as read, with an unread badge in the navbar and mobile bar.
- **Responsive:** top navbar on desktop, bottom tab bar on phones.
- **Dark mode**, **SEO titles and meta tags** per page (react-helmet-async), **lazy-loaded pages**.
- **Accessibility:** modals close with Esc, trap focus, and lock page scroll; form labels are linked to inputs.

## Tech stack

| Area | Library |
| --- | --- |
| UI | React, TypeScript, Vite |
| Styling | Tailwind CSS, HeroUI |
| Routing | react-router-dom |
| Data fetching | TanStack Query, axios |
| Forms | react-hook-form, zod |
| Misc | react-helmet-async, react-icons, react-dropzone, emoji-picker-react, jwt-decode |

## Getting started

Requirements: Node.js 18 or newer.

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and build for production
npm run preview   # preview the production build
```

If `react-helmet-async` is not installed yet:

```bash
npm i react-helmet-async
```

Put `wesal-logo.png` in the `public/` folder (the navbar, login page, and 404 page use it).

## Project structure

```
src/
├── App.tsx                 Routes (lazy loaded) and providers
├── main.tsx                Entry point and saved theme
├── context/
│   └── AuthenContext.tsx   Token state, logout, 401 handling
├── lib/
│   ├── api.ts              The single axios instance (baseURL, auth headers, 401)
│   ├── avatar.ts           Default avatar and a one-shot onError handler
│   └── time.ts             "2 hours ago" formatting
├── hooks/
│   ├── useBookmark.ts      PUT /posts/:id/bookmark (optimistic)
│   ├── useBookmarks.ts     GET /users/bookmarks
│   ├── useFollow.ts        PUT /users/:id/follow (optimistic)
│   ├── useSuggestions.ts   GET /users/suggestions
│   ├── useUnreadCount.ts   Unread notifications count
│   └── useModalA11y.ts     Esc, focus trap, scroll lock for dialogs
├── types/post.ts           Post types and response helpers
├── Layout/                 Navbar, Sidebar, Layout
├── components/             PostCard, DetailsPost, Feed, CreatePost, MobileNav, Seo, Modal, ...
└── pages/                  Home, Profile, Saved, Community, Notifications, Settings, Login, Signup, ...
```

## API usage

All requests go through `src/lib/api.ts`. It reads the token from `localStorage` and sends it as both `token` and `Authorization: Bearer <token>`, so components never set headers by hand.

| Feature | Endpoint |
| --- | --- |
| Sign in / Sign up | `POST /users/signin`, `POST /users/signup` |
| My profile | `GET /users/profile-data` |
| Other user's profile | `GET /users/:id/profile` (verify this one against the API docs) |
| User posts | `GET /users/:id/posts` |
| Suggestions | `GET /users/suggestions` |
| Follow / unfollow | `PUT /users/:id/follow` |
| Bookmarks | `GET /users/bookmarks` |
| Bookmark / unbookmark | `PUT /posts/:id/bookmark` |
| Feed, create post | `GET /posts`, `POST /posts` |
| Edit, delete post | `PUT /posts/:id`, `DELETE /posts/:id` |
| Like post | `PUT /posts/:id/like` |
| Comments | `GET/POST /posts/:id/comments`, `PUT/DELETE /posts/:id/comments/:commentId` |
| Like comment | `PUT /posts/:id/comments/:commentId/like` |
| Notifications | `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` |
| Settings | `PATCH /users/change-password` |
| Profile images | `PUT /users/upload-photo`, `PUT /users/upload-cover` |

## Known limitations

- **Share** copies a link; it does not create a repost, because no share endpoint is wired yet.
- **Reply** adds an `@name` mention; real nested replies need a replies endpoint.
- The "Public" label in Create Post is only a label; privacy is not sent to the API.

## Adding a new page

1. Create the page in `src/pages/<Name>/`.
2. Add `<Seo title="..." />` at the top of its JSX.
3. Register it in `src/App.tsx` with `lazy(() => import(...))` and wrap it with `page(...)` so it is protected and lazy loaded.
4. Use `api` from `src/lib/api.ts` for requests, never a raw `axios` call with a hard-coded URL.
