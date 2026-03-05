import { AdminBookingDetail } from "../../../../components/admin/AdminBookingDetail";
import { AdminNavbar } from "../../../../components/admin/AdminNavbar";
import { AUTH_PROFILE_NAME_COOKIE } from "../../../../lib/mock-auth";
import { cookies } from "next/headers";

type AdminBookingDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function AdminBookingDetailPage({
  params,
  searchParams,
}: AdminBookingDetailPageProps) {
  const cookieStore = await cookies();
  const { id } = await params;
  const query = await searchParams;
  const profileName = decodeURIComponent(
    cookieStore.get(AUTH_PROFILE_NAME_COOKIE)?.value ?? "admin01"
  );
  const isFromHistory = query.from === "history";

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <AdminNavbar profileName={profileName} />
        <AdminBookingDetail bookingId={id} isFromHistory={isFromHistory} />
      </div>
    </main>
  );
}
