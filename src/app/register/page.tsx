"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CountryOption,
  getCountryOptions,
  registerUser,
  setAuthSession,
} from "../../lib/mock-user-auth";

type RegisterFormData = {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  country: CountryOption;
  phoneCountryCode: string;
  phoneNumber: string;
};

const countries = getCountryOptions();
const dialCodes = ["+66", "+1", "+44", "+49", "+33", "+81", "+82", "+65", "+61", "+91"];

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    country: countries[0],
    phoneCountryCode: "+66",
    phoneNumber: "",
  });

  const canSubmit = useMemo(
    () =>
      Boolean(
        formData.username.trim() &&
          formData.password &&
          formData.confirmPassword &&
          formData.email.trim() &&
          formData.country &&
          formData.phoneCountryCode &&
          formData.phoneNumber.trim()
      ),
    [formData]
  );

  const updateField = <K extends keyof RegisterFormData>(
    key: K,
    value: RegisterFormData[K]
  ) => {
    setError("");
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    if (formData.password !== formData.confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    const result = registerUser({
      username: formData.username,
      password: formData.password,
      email: formData.email,
      country: formData.country,
      phoneCountryCode: formData.phoneCountryCode,
      phoneNumber: formData.phoneNumber,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setAuthSession("user", formData.username.trim());
    router.push("/booking");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Register</h1>
        <p className="mt-1 text-base text-slate-600">
          Create your account to save booking history and track rides across devices.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-base font-medium text-slate-700">Username *</span>
              <input
                required
                value={formData.username}
                onChange={(event) => updateField("username", event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 focus:border-sky-500 focus:ring-4"
              />
            </label>

            <label className="space-y-1">
              <span className="text-base font-medium text-slate-700">Email *</span>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 focus:border-sky-500 focus:ring-4"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-base font-medium text-slate-700">Password *</span>
              <input
                required
                type="password"
                value={formData.password}
                onChange={(event) => updateField("password", event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 focus:border-sky-500 focus:ring-4"
              />
            </label>

            <label className="space-y-1">
              <span className="text-base font-medium text-slate-700">Confirm Password *</span>
              <input
                required
                type="password"
                value={formData.confirmPassword}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 focus:border-sky-500 focus:ring-4"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-base font-medium text-slate-700">Country *</span>
              <select
                value={formData.country}
                onChange={(event) => updateField("country", event.target.value as CountryOption)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 focus:border-sky-500 focus:ring-4"
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-3 gap-3">
              <label className="space-y-1">
                <span className="text-base font-medium text-slate-700">Code *</span>
                <select
                  value={formData.phoneCountryCode}
                  onChange={(event) => updateField("phoneCountryCode", event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 focus:border-sky-500 focus:ring-4"
                >
                  {dialCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </label>
              <label className="col-span-2 space-y-1">
                <span className="text-base font-medium text-slate-700">Phone *</span>
                <input
                  required
                  value={formData.phoneNumber}
                  onChange={(event) => updateField("phoneNumber", event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 focus:border-sky-500 focus:ring-4"
                />
              </label>
            </div>
          </div>

          {error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-base text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-base font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
          >
            Create Account
          </button>
        </form>

        <div className="mt-4 border-t border-slate-200 pt-4 text-center">
          <p className="text-base text-slate-600">Already have an account?</p>
          <Link
            href="/login"
            className="mt-2 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-base font-semibold text-white transition hover:brightness-110"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}

