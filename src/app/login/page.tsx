"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MOCK_CREDENTIALS } from "../../lib/mock-auth";
import { authenticateUser, setAuthSession } from "../../lib/mock-user-auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

    const account = authenticateUser(username, password);
    if (!account) {
      setError("Invalid username or password.");
      return;
    }

    setAuthSession(account.role, account.username);
    const next = searchParams.get("next");

    if (account.role === "admin") {
      router.push("/admin");
    } else if (next && next.startsWith("/")) {
      router.push(next);
    } else {
      router.push("/booking");
    }
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
        <p className="mt-1 text-base text-slate-600">
          Login as user or admin. You can also create a new user account.
        </p>

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

        <div className="mt-4 border-t border-slate-200 pt-4 text-center">
          <p className="text-base text-slate-600">No account yet?</p>
          <Link
            href="/register"
            className="mt-2 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-base font-semibold text-white transition hover:brightness-110"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}

