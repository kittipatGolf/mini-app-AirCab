"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "../auth/LogoutButton";

type AdminNavbarProps = {
  active: "list" | "history";
  profileName?: string;
};

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "A";
}

export function AdminNavbar({ active, profileName = "Admin" }: AdminNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="grid grow grid-cols-2 gap-2">
          <Link
            href="/admin"
            onClick={() => setIsMenuOpen(false)}
            className={`rounded-xl px-3 py-2 text-center text-base font-medium transition ${
              active === "list"
                ? "bg-sky-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Booking List
          </Link>
          <Link
            href="/admin/history"
            onClick={() => setIsMenuOpen(false)}
            className={`rounded-xl px-3 py-2 text-center text-base font-medium transition ${
              active === "history"
                ? "bg-sky-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            History
          </Link>
        </div>

        <div className="relative shrink-0" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5"
          >
            <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {getInitial(profileName)}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs text-slate-500">Profile</p>
              <p className="text-base font-medium text-slate-900">{profileName}</p>
            </div>
          </button>

          {isMenuOpen ? (
            <div className="absolute right-0 mt-2 w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
              <LogoutButton
                className="block w-full rounded-lg px-3 py-2 text-left text-base font-medium text-slate-700 hover:bg-slate-100"
                label="Logout"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
