"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AUTH_COOKIE_NAME,
  AUTH_PROFILE_NAME_COOKIE,
  MOCK_CREDENTIALS,
} from "../../lib/mock-auth";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const hints = useMemo(
    () =>
      MOCK_CREDENTIALS.map((item) => `${item.label}: ${item.username} / ${item.password}`),
    []
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const account = MOCK_CREDENTIALS.find(
      (item) => item.username === username.trim() && item.password === password
    );

    if (!account) {
      setError("Username หรือ Password ไม่ถูกต้อง");
      return;
    }

    document.cookie = `${AUTH_COOKIE_NAME}=${account.role}; path=/; max-age=86400; samesite=lax`;
    document.cookie = `${AUTH_PROFILE_NAME_COOKIE}=${encodeURIComponent(account.username)}; path=/; max-age=86400; samesite=lax`;
    router.push(account.role === "admin" ? "/admin" : "/booking");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
        <p className="mt-1 text-base text-slate-600">เข้าสู่ระบบเพื่อเข้าใช้งาน User หรือ Admin</p>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-base font-medium text-slate-800">Mock Credentials</p>
          <ul className="mt-1 space-y-1 text-base text-slate-700">
            {hints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block space-y-1">
            <span className="text-base font-medium text-slate-700">Username</span>
            <input
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 focus:border-sky-500 focus:ring-4"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-base font-medium text-slate-700">Password</span>
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-sky-200 focus:border-sky-500 focus:ring-4"
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-base text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-base font-semibold text-white transition hover:brightness-110"
          >
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}
