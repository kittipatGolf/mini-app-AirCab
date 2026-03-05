"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "../auth/LogoutButton";

type AppNavbarProps = {
  isAdmin?: boolean;
  profileName?: string;
};

const pages = [
  { href: "/booking", label: "Booking" },
];

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "A";
}

export function AppNavbar({ isAdmin = false, profileName = "admin01" }: AppNavbarProps) {
  const pathname = usePathname();
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
    <header className="sticky top-0 z-30 mb-3 w-full border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:mx-auto sm:mt-3 sm:max-w-6xl sm:rounded-2xl sm:border sm:px-5">
      <div className="flex items-center justify-between gap-4">
        <nav className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto pr-2">
          {pages.map((page) => {
            const isActive = pathname === page.href;
            return (
              <Link
                key={page.href}
                href={page.href}
                onClick={() => setIsMenuOpen(false)}
                className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-base font-medium transition ${
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

        {isAdmin ? (
          <div className="relative shrink-0" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5"
            >
              <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {getInitial(profileName)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs text-slate-500">Admin</p>
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
        ) : null}
      </div>
    </header>
  );
}
