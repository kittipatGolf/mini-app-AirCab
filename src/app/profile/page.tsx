import Link from "next/link";
import { BookingHistory } from "../../components/booking/BookingHistory";
import { AppNavbar } from "../../components/navigation/AppNavbar";
import { UserProfileInfo } from "../../components/profile/UserProfileInfo";

type ProfilePageProps = {
  searchParams?: Promise<{ tab?: string }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const activeTab = params?.tab === "profile" ? "profile" : "history";

  return (
    <main className="min-h-screen bg-slate-100 pb-4 sm:px-6 sm:py-6 lg:px-8">
      <AppNavbar profileName="Kitti" />
      <div className="mx-auto mt-4 w-full max-w-6xl px-4 sm:mt-0 sm:px-0">
        <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-2">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/profile?tab=history"
              className={`rounded-xl px-3 py-2 text-center text-base font-medium transition ${
                activeTab === "history"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              History
            </Link>
            <Link
              href="/profile?tab=profile"
              className={`rounded-xl px-3 py-2 text-center text-base font-medium transition ${
                activeTab === "profile"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Profile
            </Link>
          </div>
        </section>

        {activeTab === "history" ? <BookingHistory /> : <UserProfileInfo profileName="Kitti" />}
      </div>
    </main>
  );
}
