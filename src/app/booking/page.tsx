import { cookies } from "next/headers";
import { BookingForm } from "../../components/booking/BookingForm";
import { AppNavbar } from "../../components/navigation/AppNavbar";
import { AUTH_COOKIE_NAME, AUTH_PROFILE_NAME_COOKIE } from "../../lib/mock-auth";

export default async function BookingPage() {
  const cookieStore = await cookies();
  const role = (cookieStore.get(AUTH_COOKIE_NAME)?.value as "user" | "admin" | undefined) ?? null;
  const profileNameRaw = cookieStore.get(AUTH_PROFILE_NAME_COOKIE)?.value;
  const profileName = profileNameRaw ? decodeURIComponent(profileNameRaw) : undefined;

  return (
    <main className="min-h-screen bg-slate-100 pb-4 sm:px-6 sm:py-6 lg:px-8">
      <AppNavbar role={role} profileName={profileName} />
      <div className="mx-auto mt-4 w-full max-w-6xl px-4 sm:mt-0 sm:px-0">
        <BookingForm />
      </div>
    </main>
  );
}
