import LeftSide from "./LeftSide";
import { Outlet } from "react-router-dom";

export default function LayoutSign() {
  return (
    <>
      <main className="min-h-dvh bg-[#f1f3f6] px-4 py-6 sm:px-5 sm:py-8 lg:px-16 xl:px-24">
        <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-[1250px] items-center gap-6 lg:gap-10 lg:grid-cols-2">
          <div className="flex items-center justify-center gap-3 lg:hidden">
            <img
              src="/wesal-logo.png"
              alt="Wesal Logo"
              className="h-12 w-12 object-contain"
            />
            <h1 className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-4xl font-extrabold leading-none tracking-tight text-transparent">
              WESAL
            </h1>
          </div>
          <LeftSide />
          <Outlet />
        </div>
      </main>
    </>
  );
}
