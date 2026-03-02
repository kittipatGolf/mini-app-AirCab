import { BookingForm } from "../../components/booking/BookingForm";
import { AppNavbar } from "../../components/navigation/AppNavbar";

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-slate-100 pb-4 sm:px-6 sm:py-6 lg:px-8">
      <AppNavbar profileName="Kitti" />
      <div className="mx-auto mt-4 w-full max-w-6xl px-4 sm:mt-0 sm:px-0">
        <BookingForm />
      </div>
    </main>
  );
}
