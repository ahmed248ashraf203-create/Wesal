import React, { useContext, useState } from "react";
import { Button, Input, Label, ListBox, Select, toast } from "@heroui/react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiAtSign,
  FiMail,
  FiUsers,
  FiCalendar,
  FiKey,
} from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../Schema/LoginSchema";
import type { LoginForm } from "./Login-types";
import axios, { isAxiosError } from "axios";
import { AuthencreatedContext } from "../../../context/AuthenContext";
export default function Login() {
  const {
    handleSubmit,
    register,
    control,
    setError,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
    resolver: zodResolver(loginSchema),
  });
  const [loading, setLoding] = useState(false);
  const { addsetToken } = useContext(AuthencreatedContext);
  let nav = useNavigate();

  async function myhandleSubmit(values: LoginForm) {
    console.log("helllllo", values);
    try {
      if (loading) {
        return;
      }

      setLoding(true);
      let { data } = await axios.post(
        "https://route-posts.routemisr.com/users/signin",
        values,
      );
      console.log("Response:", data);

      toast.success(data.message);
      addsetToken(data.data.token);
      nav("/home");
    } catch (error) {
      if (isAxiosError(error)) {
        toast.danger(error.response?.data.message);
      }
    } finally {
      setLoding(false);
      reset();
    }
  }

  return (
    <>
      <section className="mx-auto w-full max-w-[465px] rounded-2xl bg-white p-6 shadow-sm sm:p-7">
        {/* Login / Register */}
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

        {/* ================= FORM ================= */}
        <form className="space-y-3.5" onSubmit={handleSubmit(myhandleSubmit)}>
          {/* Email */}
          <Input
            {...register("email")}
            aria-label="Email address"
            placeholder="Email address"
            type="email"
            className="h-12 w-full rounded-xl border border-[#dce3ec] bg-[#f8fafc] px-4 text-[14px] shadow-none"
          />
          {errors.email?.message && (
            <p className="mt-1.5 flex p-2 rounded-xl items-center gap-1.5 text-xs font-medium text-red-800 bg-red-100 ">
              <span className="text-sm">⚠</span>
              {errors.email.message}
            </p>
          )}
          {/* Password */}
          <Input
            {...register("password")}
            aria-label="Password"
            placeholder="Password"
            type="password"
            className="h-12 w-full rounded-xl border border-[#dce3ec] bg-[#f8fafc] px-4 text-[14px] shadow-none"
          />
          {errors.password?.message && (
            <p className="mt-1.5 flex p-2 rounded-xl items-center gap-1.5 text-xs font-medium text-red-800 bg-red-100 ">
              <span className="text-sm">⚠</span>
              {errors.password.message}
            </p>
          )}
          {/* Submit */}
          <Button
            isDisabled={loading}
            type="submit"
            variant="primary"
            className="mt-1 h-13 w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-[16px] font-bold text-white shadow-none transition duration-300 hover:brightness-110"
          >
            {loading ? "loading..." : " Log in"}
          </Button>
        </form>
      </section>
    </>
  );
}
