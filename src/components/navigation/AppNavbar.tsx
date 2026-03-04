"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { LogoutButton } from "../auth/LogoutButton";
import { AppRole } from "../../lib/mock-auth";

type AppNavbarProps = {
  role?: AppRole | null;
  profileName?: string;
};

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "U";
}

export function AppNavbar({ role = null, profileName }: AppNavbarProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const clientName = profileName || "Guest";

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

  const pages = useMemo(() => {
    const items: Array<{ href: string; label: string }> = [{ href: "/booking", label: "Booking" }];
    if (role === "user") {
      items.push({ href: "/profile", label: "User Profile" });
    }
    if (role === "admin") {
      items.push({ href: "/admin", label: "Admin" });
    }
    return items;
  }, [role]);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:mx-auto sm:max-w-6xl sm:rounded-2xl sm:border sm:px-4">
      <div className="flex items-center justify-between gap-3">
        <nav className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pr-1">
          {pages.map((page) => {
            const isActive = pathname === page.href;
            return (
              <Link
                key={page.href}
                href={page.href}
                onClick={() => setIsMenuOpen(false)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-base font-medium transition ${
                  isActive
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {page.label}
              </Link>
            );
          })}
        </nav>

        {role ? (
          <div className="relative shrink-0" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5"
            >
              <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {getInitial(clientName)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs text-slate-500">Profile</p>
                <p className="text-base font-medium text-slate-900">{clientName}</p>
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
        ) : (
          <Link
            href="/login"
            className="shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-base font-semibold text-white transition hover:brightness-110"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
