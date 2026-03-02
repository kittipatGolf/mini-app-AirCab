import { AdminBookingDetail } from "../../../../components/admin/AdminBookingDetail";
import { AdminNavbar } from "../../../../components/admin/AdminNavbar";
import { AUTH_PROFILE_NAME_COOKIE } from "../../../../lib/mock-auth";
import { cookies } from "next/headers";

type AdminBookingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminBookingDetailPage({
  params,
}: AdminBookingDetailPageProps) {
  const cookieStore = await cookies();
  const { id } = await params;
  const profileName = decodeURIComponent(
    cookieStore.get(AUTH_PROFILE_NAME_COOKIE)?.value ?? "admin01"
  );

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <AdminNavbar active="list" profileName={profileName} />
        <AdminBookingDetail bookingId={id} />
      </div>
    </main>
  );
}
