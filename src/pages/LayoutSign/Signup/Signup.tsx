import { Button, Input, Label, ListBox, Select, toast } from "@heroui/react";

import { NavLink, useNavigate } from "react-router-dom";

import { FiUsers, FiCalendar } from "react-icons/fi";
import { Controller, useForm } from "react-hook-form";
import type { SignupForm } from "./Signup-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../../Schema/signupSchema";
import { useContext, useState } from "react";
import { api, getErrorMessage } from "../../../lib/api";
import { AuthencreatedContext } from "../../../context/AuthenContext";
import FieldError from "../FieldError";
import Seo from "../../../components/Seo/Seo";

export default function Signup() {
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<SignupForm>({
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

  const nav = useNavigate();

  const [loading, setLoding] = useState(false);
  async function myhandleSubmit(values: SignupForm) {
    if (loading) return;

    try {
      setLoding(true);

      const { data } = await api.post("/users/signup", values);

      toast.success(data.message);
      addsetToken(data.data.token);
      nav("/home");
    } catch (error) {
      // The form is NOT reset on failure (for example a duplicate email),
      // so the user only has to fix the one field.
      toast.danger(getErrorMessage(error, "Signup failed. Please try again."));
    } finally {
      setLoding(false);
    }
  }
  return (
    <>
      <Seo
        title="Create account"
        description="Join Wesal: create a free account and start sharing."
      />
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
          <div>
            <Input
              {...register("name")}
              aria-label="Full name"
              aria-invalid={!!errors.name}
              placeholder="Full name"
              type="text"
              className={`h-12 w-full rounded-xl border px-4 text-[14px] shadow-none transition-all duration-200 ${
                errors.name
                  ? "border-red-300 bg-red-50/50 focus-within:ring-2 focus-within:ring-red-100"
                  : "border-[#dce3ec] bg-[#f8fafc] focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100"
              }`}
            />
            <FieldError message={errors.name?.message} />
          </div>

          {/* Username */}
          <div>
            <Input
              {...register("username")}
              aria-label="Username"
              aria-invalid={!!errors.username}
              placeholder="Username"
              type="text"
              className={`h-12 w-full rounded-xl border px-4 text-[14px] shadow-none transition-all duration-200 ${
                errors.username
                  ? "border-red-300 bg-red-50/50 focus-within:ring-2 focus-within:ring-red-100"
                  : "border-[#dce3ec] bg-[#f8fafc] focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100"
              }`}
            />
            <FieldError message={errors.username?.message} />
          </div>

          {/* Email */}
          <div>
            <Input
              {...register("email")}
              aria-label="Email address"
              aria-invalid={!!errors.email}
              placeholder="Email address"
              type="email"
              autoComplete="email"
              className={`h-12 w-full rounded-xl border px-4 text-[14px] shadow-none transition-all duration-200 ${
                errors.email
                  ? "border-red-300 bg-red-50/50 focus-within:ring-2 focus-within:ring-red-100"
                  : "border-[#dce3ec] bg-[#f8fafc] focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100"
              }`}
            />
            <FieldError message={errors.email?.message} />
          </div>

          {/* Gender */}
          <div>
            {/* Controller connects the HeroUI Select to react-hook-form,
                otherwise the chosen value never reaches the submitted data. */}
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  aria-label="Gender"
                  placeholder="Select gender"
                  className="w-full"
                  selectedKey={field.value || null}
                  onSelectionChange={(key) =>
                    field.onChange(key == null ? "" : String(key))
                  }
                >
                  <Label className="sr-only">Gender</Label>

                  <Select.Trigger
                    className={`h-12 rounded-xl border bg-[#f8fafc] px-4 shadow-none transition-all duration-200 ${
                      errors.gender
                        ? "border-red-300 bg-red-50/50"
                        : "border-[#dce3ec] focus-within:border-indigo-400"
                    }`}
                  >
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
              )}
            />

            <FieldError message={errors.gender?.message} />
          </div>

          {/* Date of Birth */}
          <div>
            <div
              className={`relative rounded-xl transition-all duration-200 ${
                errors.dateOfBirth
                  ? "rounded-xl ring-2 ring-red-100"
                  : "focus-within:ring-2 focus-within:ring-indigo-100"
              }`}
            >
              <FiCalendar className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[19px] text-[#91a4bf]" />

              <Input
                {...register("dateOfBirth")}
                aria-label="Date of birth"
                aria-invalid={!!errors.dateOfBirth}
                type="date"
                className={`h-12 w-full rounded-xl border pl-11 pr-4 text-[14px] shadow-none transition-all duration-200 ${
                  errors.dateOfBirth
                    ? "border-red-300 bg-red-50/50"
                    : "border-[#dce3ec] bg-[#f8fafc] focus-within:border-indigo-400"
                }`}
              />
            </div>

            <FieldError message={errors.dateOfBirth?.message} />
          </div>

          {/* Password */}
          <div>
            <Input
              {...register("password")}
              aria-label="Password"
              aria-invalid={!!errors.password}
              placeholder="Password"
              type="password"
              autoComplete="new-password"
              className={`h-12 w-full rounded-xl border px-4 text-[14px] shadow-none transition-all duration-200 ${
                errors.password
                  ? "border-red-300 bg-red-50/50 focus-within:ring-2 focus-within:ring-red-100"
                  : "border-[#dce3ec] bg-[#f8fafc] focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100"
              }`}
            />
            <FieldError message={errors.password?.message} />
          </div>

          {/* Confirm Password */}
          <div>
            <Input
              {...register("rePassword")}
              aria-label="Confirm password"
              aria-invalid={!!errors.rePassword}
              placeholder="Confirm password"
              type="password"
              autoComplete="new-password"
              className={`h-12 w-full rounded-xl border px-4 text-[14px] shadow-none transition-all duration-200 ${
                errors.rePassword
                  ? "border-red-300 bg-red-50/50 focus-within:ring-2 focus-within:ring-red-100"
                  : "border-[#dce3ec] bg-[#f8fafc] focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100"
              }`}
            />
            <FieldError message={errors.rePassword?.message} />
          </div>

          {/* Submit */}
          <Button
            isDisabled={loading}
            type="submit"
            variant="primary"
            className="mt-1 h-13 w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-[16px] font-bold text-white shadow-none transition duration-300 hover:brightness-110"
          >
            {loading ? "Loading..." : "Create New Account"}
          </Button>
        </form>
      </section>
    </>
  );
}
