import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toast } from "@heroui/react";
import { QueryClientProvider } from "@tanstack/react-query";

import Layout from "./Layout/Layout";
import LayoutSign from "./pages/LayoutSign/LayoutSign";
import Login from "./pages/LayoutSign/Login/Login";
import Signup from "./pages/LayoutSign/Signup/Signup";
import AuthenContext from "./context/AuthenContext";
import ProtectedRout from "./components/ProtectedRout/ProtectedRout";
import PageLoader from "./components/Loader/PageLoader";
import queryClient from "./JQuery/JQuery";

const Home = lazy(() => import("./pages/Home/Home"));
const MyPosts = lazy(() => import("./components/MyPosts/MyPosts"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const Notifications = lazy(() => import("./pages/Notifications/Notifications"));
const Settings = lazy(() => import("./pages/Settings/Settings"));
const Saved = lazy(() => import("./pages/Saved/Saved"));
const Community = lazy(() => import("./pages/Community/Community"));
const PageError = lazy(() => import("./pages/PageError/PageError"));

function page(element: React.ReactNode) {
  return (
    <ProtectedRout>
      <Suspense fallback={<PageLoader />}>{element}</Suspense>
    </ProtectedRout>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutSign />,
    children: [
      { index: true, element: <Login /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
    ],
  },

  {
    element: <Layout />,
    children: [
      { path: "/home", element: page(<Home />) },
      { path: "/my-posts", element: page(<MyPosts />) },
      { path: "/saved", element: page(<Saved />) },
      { path: "/community", element: page(<Community />) },
      { path: "/profile", element: page(<Profile />) },
      { path: "/profile/:id", element: page(<Profile />) },
      { path: "/notifications", element: page(<Notifications />) },
      { path: "/settings", element: page(<Settings />) },
    ],
  },

  {
    path: "*",
    element: (
      <Suspense fallback={<PageLoader />}>
        <PageError />
      </Suspense>
    ),
  },
]);

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthenContext>
          <Toast.Provider />
          <RouterProvider router={router} />
        </AuthenContext>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
