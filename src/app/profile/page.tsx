import { BookingHistory } from "../../components/booking/BookingHistory";
import { AppNavbar } from "../../components/navigation/AppNavbar";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <AppNavbar profileName="Kitti" />
        <BookingHistory />
      </div>
    </main>
  );
}
