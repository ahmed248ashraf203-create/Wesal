import { useContext, useState } from "react";
import { Button, Input, toast } from "@heroui/react";
import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema } from "../../Schema/LoginSchema";
import type { LoginForm } from "./Login-types";
import { api, getErrorMessage } from "../../../lib/api";
import { AuthencreatedContext } from "../../../context/AuthenContext";
import Seo from "../../../components/Seo/Seo";

export default function Login() {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
    resolver: zodResolver(loginSchema),
  });

  const [loading, setLoading] = useState(false);

  const { addsetToken } = useContext(AuthencreatedContext);
  const nav = useNavigate();

  async function myhandleSubmit(values: LoginForm) {
    if (loading) return;

    try {
      setLoading(true);

      const { data } = await api.post("/users/signin", {
        ...values,
        email: values.email.trim(),
      });

      toast.success(data.message);

      addsetToken(data.data.token);

      nav("/home");
    } catch (error) {
      toast.danger(getErrorMessage(error, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Seo
        title="Log in"
        description="Log in to Wesal and continue your social journey."
      />

      <section className="mx-auto w-full max-w-[465px] rounded-2xl bg-white p-6 shadow-sm sm:p-7">
        {/* Login / Signup Tabs */}
        <div className="mb-7 flex h-[46px] rounded-xl bg-[#f0f4f8] p-1">
          <NavLink
            to="/Login"
            className={({ isActive }) =>
              `flex flex-1 items-center justify-center rounded-lg text-sm font-semibold transition ${
                isActive
                  ? "bg-white text-[#0b3694] shadow-sm"
                  : "text-[#17223b] hover:bg-white"
              }`
            }
          >
            Login
          </NavLink>

          <NavLink
            to="/Signup"
            className={({ isActive }) =>
              `flex flex-1 items-center justify-center rounded-lg text-sm font-semibold transition ${
                isActive
                  ? "bg-white text-[#0b3694] shadow-sm"
                  : "text-[#17223b] hover:bg-white"
              }`
            }
          >
            Signup
          </NavLink>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-[24px] font-bold text-[#101828]">
            Log in to WESAL Posts
          </h2>

          <p className="mt-1 text-[14px] text-[#8995a7]">
            Log in and continue your social journey.
          </p>
        </div>

        {/* Login Form */}
        <form
          className="space-y-3.5"
          onSubmit={handleSubmit(myhandleSubmit)}
          noValidate
        >
          {/* Email */}
          <div>
            <Input
              {...register("email")}
              aria-label="Email address"
              placeholder="Email address"
              type="text"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="h-12 w-full rounded-xl border border-[#dce3ec] bg-[#f8fafc] px-4 text-[14px] shadow-none"
            />

            {errors.email?.message && (
              <p className="mt-1.5 flex items-center gap-1.5 rounded-xl bg-red-100 p-2 text-xs font-medium text-red-800">
                <span className="text-sm">⚠</span>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <Input
              {...register("password")}
              aria-label="Password"
              placeholder="Password"
              type="password"
              autoComplete="current-password"
              className="h-12 w-full rounded-xl border border-[#dce3ec] bg-[#f8fafc] px-4 text-[14px] shadow-none"
            />

            {errors.password?.message && (
              <p className="mt-1.5 flex items-center gap-1.5 rounded-xl bg-red-100 p-2 text-xs font-medium text-red-800">
                <span className="text-sm">⚠</span>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            isDisabled={loading}
            type="submit"
            variant="primary"
            className="mt-1 h-13 w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-[16px] font-bold text-white shadow-none transition duration-300 hover:brightness-110"
          >
            {loading ? "Loading..." : "Log in"}
          </Button>
        </form>
      </section>
    </>
  );
}
