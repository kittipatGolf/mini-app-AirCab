"use client";

import { useRouter } from "next/navigation";
import { clearAuthSession } from "../../lib/mock-user-auth";

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
        clearAuthSession();
        router.push("/booking");
        router.refresh();
      }}
      className={className}
    >
      {label}
    </button>
  );
}
