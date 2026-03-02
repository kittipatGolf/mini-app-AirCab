import { AdminBookingDetail } from "../../../../components/admin/AdminBookingDetail";

type AdminBookingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminBookingDetailPage({
  params,
}: AdminBookingDetailPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <AdminBookingDetail bookingId={id} />
      </div>
    </main>
  );
}
