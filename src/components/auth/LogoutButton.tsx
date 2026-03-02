"use client";

import { useRouter } from "next/navigation";
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

  return (
    <button
      type="button"
      onClick={() => {
        document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
        document.cookie = `${AUTH_PROFILE_NAME_COOKIE}=; path=/; max-age=0; samesite=lax`;
        router.push("/login");
        router.refresh();
      }}
      className={className}
    >
      {label}
    </button>
  );
}
