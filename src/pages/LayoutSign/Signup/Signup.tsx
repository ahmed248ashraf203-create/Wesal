import { Button, Input, Label, ListBox, Select, toast } from "@heroui/react";

import { NavLink, useNavigate } from "react-router-dom";

import {
  FiUser,
  FiAtSign,
  FiMail,
  FiUsers,
  FiCalendar,
  FiKey,
} from "react-icons/fi";
import { Controller, useForm } from "react-hook-form";
import type { SignupForm } from "./Signup-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../../Schema/signupSchema";
import axios, { isAxiosError } from "axios";
import { useContext, useState } from "react";
import { boolean } from "zod";
import { AuthencreatedContext } from "../../../context/AuthenContext";

export default function Signup() {
  const {
    handleSubmit,
    register,
    control,
    setError,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      dateOfBirth: "",
      gender: "male",
      password: "",
      rePassword: "",
    },
    mode: "onSubmit",
    resolver: zodResolver(signupSchema),
  });
  const { addsetToken } = useContext(AuthencreatedContext);

  let nav = useNavigate();

  const [loading, setLoding] = useState(false);
  async function myhandleSubmit(values: SignupForm) {
    console.log("helllllo", values);
    try {
      if (loading) {
        return;
      }

      setLoding(true);
      let { data } = await axios.post(
        "https://route-posts.routemisr.com/users/signup",
        values,
      );
      toast.success(data.message);
      addsetToken(data.data.token);
      setTimeout(() => {
        nav("/home");
      }, 2000);
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
            Create a new account
          </h2>

          <p className="mt-1 text-[14px] text-[#8995a7]">
            It is quick and easy.
          </p>
        </div>

        {/* ================= FORM ================= */}
        <form className="space-y-3.5" onSubmit={handleSubmit(myhandleSubmit)}>
          {/* Full Name */}
          <Input
            {...register("name")}
            aria-label="Full name"
            placeholder="Full name"
            type="text"
            className="h-12 w-full rounded-xl border border-[#dce3ec] bg-[#f8fafc] px-4 text-[14px] shadow-none"
          />
          {errors.name?.message && (
            <p className="mt-1.5 flex p-2 rounded-xl items-center gap-1.5 text-xs font-medium text-red-800 bg-red-100 ">
              <span className="text-sm">⚠</span>
              {errors.name.message}
            </p>
          )}
          {/* Username */}
          <Input
            {...register("username")}
            aria-label="Username"
            placeholder="Username (optional)"
            type="text"
            className="h-12 w-full rounded-xl border border-[#dce3ec] bg-[#f8fafc] px-4 text-[14px] shadow-none"
          />
          {errors.username?.message && (
            <p className="mt-1.5 flex p-2 rounded-xl items-center gap-1.5 text-xs font-medium text-red-800 bg-red-100 ">
              <span className="text-sm">⚠</span>
              {errors.username.message}
            </p>
          )}
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
          {/* Gender */}
          <Select
            aria-label="Gender"
            placeholder="Select gender"
            className="w-full"
          >
            <Label className="sr-only">Gender</Label>

            <Select.Trigger className="h-12 rounded-xl border border-[#dce3ec] bg-[#f8fafc] px-4 shadow-none">
              <FiUsers className="mr-3 text-[20px] text-[#91a4bf]" />

              <Select.Value />

              <Select.Indicator />
            </Select.Trigger>

            <Select.Popover>
              <ListBox>
                <ListBox.Item id="male" textValue="Male">
                  Male
                  <ListBox.ItemIndicator />
                </ListBox.Item>

                <ListBox.Item id="female" textValue="Female">
                  Female
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>

          {/* Date */}
          <div className="relative">
            <FiCalendar className="pointer-events-none absolute left-4 top-1/2 zod-10 -translate-y-1/2 text-[19px] text-[#91a4bf]" />
            <Input
              {...register("dateOfBirth")}
              aria-label="Date of birth"
              type="date"
              className="h-12 w-full rounded-xl border border-[#dce3ec] bg-[#f8fafc] pl-11 pr-4 text-[14px] shadow-none"
            />{" "}
            {errors.dateOfBirth?.message && (
              <p className="mt-1.5 flex p-2 rounded-xl items-center gap-1.5 text-xs font-medium text-red-800 bg-red-100 ">
                <span className="text-sm">⚠</span>
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>
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
          {/* Confirm Password */}
          <Input
            {...register("rePassword")}
            aria-label="Confirm password"
            placeholder="Confirm password"
            type="password"
            className="h-12 w-full rounded-xl border border-[#dce3ec] bg-[#f8fafc] px-4 text-[14px] shadow-none"
          />
          {errors.rePassword?.message && (
            <p className="mt-1.5 flex p-2 rounded-xl items-center gap-1.5 text-xs font-medium text-red-800 bg-red-100 ">
              <span className="text-sm">⚠</span>
              {errors.rePassword.message}
            </p>
          )}
          {/* Submit */}
          <Button
            isDisabled={loading}
            type="submit"
            variant="primary"
            className="mt-1 h-13 w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-[16px] font-bold text-white shadow-none transition duration-300 hover:brightness-110"
          >
            {loading ? "loading..." : "  Create New Account"}
          </Button>
        </form>
      </section>
    </>
  );
}
