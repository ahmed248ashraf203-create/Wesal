import { Button } from "@heroui/react";
import {
  FaHouse,
  FaArrowLeft,
  FaCompass,
  FaMagnifyingGlass,
} from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";

export default function PageError() {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#f8faff] px-4 py-6">
      {/* Background */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative w-full max-w-xl">
        {/* Brand */}
        <Link
          to="/home"
          className="mb-6 flex items-center justify-center gap-2"
        >
          <img
            src="/wesal-logo.png"
            alt="Wesal"
            className="h-9 w-9 object-contain"
          />

          <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
            wesal
          </span>
        </Link>

        {/* Error Card */}
        <section className="overflow-hidden rounded-3xl border border-white bg-white/90 px-5 py-7 text-center shadow-xl shadow-indigo-950/[0.06] backdrop-blur-xl sm:px-10 sm:py-8">
          {/* Illustration */}
          <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-violet-100">
            <div className="flex h-14 w-14 -rotate-6 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-indigo-200 transition-transform duration-300 hover:rotate-0">
              <FaCompass className="text-3xl text-white" />
            </div>

            <FaMagnifyingGlass className="absolute -right-2 -top-1 rounded-full bg-white p-2 text-2xl text-indigo-600 shadow-md" />
          </div>

          {/* 404 */}
          <h1 className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-7xl font-black leading-none tracking-tighter text-transparent sm:text-8xl">
            404
          </h1>

          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400">
            Page not found
          </p>

          {/* Description */}
          <h2 className="mt-4 text-xl font-extrabold text-slate-800 sm:text-2xl">
            Oops! You seem lost.
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            This page doesn't exist or may have moved. Let's get you back on
            track!
          </p>

          {/* Actions */}
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              variant="outline"
              onPress={() => navigate(-1)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-5 font-semibold text-slate-700 transition-all duration-300 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <FaArrowLeft />
              Go Back
            </Button>

            <Button
              onPress={() => navigate("/home")}
              className="h-11 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 font-bold text-white shadow-md shadow-indigo-200/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <FaHouse />
              Back to Home
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400">
              Need a fresh start?{" "}
              <Link
                to="/home"
                className="font-bold text-indigo-600 transition-colors hover:text-violet-600"
              >
                Explore Wesal
              </Link>
            </p>
          </div>
        </section>

        <p className="mt-4 text-center text-[10px] font-medium tracking-wider text-slate-400">
          CONNECT WITH THE WORLD AROUND YOU · WESAL
        </p>
      </div>
    </main>
  );
}
