import React from "react";
import LeftSide from "./LeftSide";
import { Outlet } from "react-router-dom";

export default function LayoutSign() {
  return (
    <>
      <main className="min-h-screen bg-[#f1f3f6] px-5 py-8 lg:px-16 xl:px-24">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1250px] items-center gap-10 lg:grid-cols-2">
          <LeftSide />
          <Outlet />
        </div>
      </main>
    </>
  );
}
