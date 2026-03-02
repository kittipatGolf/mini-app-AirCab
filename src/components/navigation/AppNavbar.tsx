"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "../auth/LogoutButton";

type AppNavbarProps = { profileName: string };

const pages = [
  { href: "/", label: "Booking" },
  { href: "/profile", label: "User Profile" },
];

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "P";
}

export function AppNavbar({ profileName }: AppNavbarProps) {
  const pathname = usePathname();

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

        <div className="flex shrink-0 items-center gap-2">
          <LogoutButton className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100" />
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {getInitial(profileName)}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-slate-500">Profile</p>
              <p className="text-base font-medium text-slate-900">{profileName}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

