import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "./pages/Home/Home";
import Layout from "./Layout/Layout";
import LayoutSign from "./pages/LayoutSign/LayoutSign";
import Login from "./pages/LayoutSign/Login/Login";
import Signup from "./pages/LayoutSign/Signup/Signup";
import PageError from "./pages/PageError/PageError";
import AuthenContext from "./context/AuthenContext";
import ProtectedRout from "./components/ProtectedRout/ProtectedRout";
import Profile from "./pages/Profile/Profile";
import Notifications from "./pages/Notifications/Notifications";
import MyPosts from "./components/MyPosts/MyPosts";

import { Toast } from "@heroui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./JQuery/JQuery";

function App() {
  const rout = createBrowserRouter([
    {
      path: "/",
      element: <LayoutSign />,
      children: [
        {
          index: true,
          element: <Login />,
        },
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "signup",
          element: <Signup />,
        },
      ],
    },

    {
      element: <Layout />,
      children: [
        {
          path: "/home",
          element: (
            <ProtectedRout>
              <Home />
            </ProtectedRout>
          ),
        },
        {
          path: "/my-posts",
          element: (
            <ProtectedRout>
              <MyPosts />
            </ProtectedRout>
          ),
        },
        {
          path: "/profile",
          element: (
            <ProtectedRout>
              <Profile />
            </ProtectedRout>
          ),
        },
        {
          path: "/Notifications",
          element: (
            <ProtectedRout>
              <Notifications />
            </ProtectedRout>
          ),
        },
      ],
    },

    {
      path: "*",
      element: <PageError />,
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthenContext>
        <Toast.Provider />
        <RouterProvider router={rout} />
      </AuthenContext>
    </QueryClientProvider>
  );
}

export default App;
