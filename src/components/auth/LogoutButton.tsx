"use client";

import { usePathname, useRouter } from "next/navigation";
import { AUTH_COOKIE_NAME, AUTH_PROFILE_NAME_COOKIE } from "../../lib/mock-auth";

type LogoutButtonProps = {
  className?: string;
  label?: string;
};

export function LogoutButton({
  className = "",
  label = "Logout",
}: LogoutButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <button
      type="button"
      onClick={() => {
        document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
        document.cookie = `${AUTH_PROFILE_NAME_COOKIE}=; path=/; max-age=0; samesite=lax`;
        if (pathname === "/booking") {
          router.refresh();
          return;
        }
        router.push("/booking");
      }}
      className={className}
    >
      {label}
    </button>
  );
}
