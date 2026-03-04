import { cookies } from "next/headers";
import { BookingForm } from "../../components/booking/BookingForm";
import { AppNavbar } from "../../components/navigation/AppNavbar";
import { AUTH_COOKIE_NAME, AUTH_PROFILE_NAME_COOKIE } from "../../lib/mock-auth";

export default async function BookingPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get(AUTH_COOKIE_NAME)?.value === "admin";
  const profileName = decodeURIComponent(
    cookieStore.get(AUTH_PROFILE_NAME_COOKIE)?.value ?? "admin01"
  );

  return (
    <main className="min-h-screen bg-slate-100 pb-4 sm:px-6 sm:py-6 lg:px-8">
      <AppNavbar isAdmin={isAdmin} profileName={profileName} />
      <div className="mx-auto mt-4 w-full max-w-6xl px-4 sm:mt-0 sm:px-0">
        <BookingForm />
      </div>
    </main>
  );
}
