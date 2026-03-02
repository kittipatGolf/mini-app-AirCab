import { AdminBookingList } from "../../components/admin/AdminBookingList";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <AdminBookingList />
      </div>
    </main>
  );
}
