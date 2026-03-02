type HistoryItem = {
  id: string;
  airport: string;
  destination: string;
  date: string;
  status: "Pending" | "Confirmed" | "Completed";
};

const mockHistory: HistoryItem[] = [
  {
    id: "BK-240301",
    airport: "Suvarnabhumi Airport (BKK)",
    destination: "Sukhumvit 24, Bangkok",
    date: "2026-03-01 19:40",
    status: "Confirmed",
  },
  {
    id: "BK-240227",
    airport: "Don Mueang Airport (DMK)",
    destination: "Phaya Thai, Bangkok",
    date: "2026-02-27 08:10",
    status: "Completed",
  },
];

function statusClass(status: HistoryItem["status"]) {
  if (status === "Completed") return "bg-emerald-100 text-emerald-800";
  if (status === "Confirmed") return "bg-sky-100 text-sky-800";
  return "bg-amber-100 text-amber-800";
}

export function BookingHistory() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-slate-900">Booking History</h2>
      <p className="mt-1 text-base text-slate-600">รายการจองย้อนหลังของผู้ใช้งาน</p>

      <div className="mt-4 space-y-3">
        {mockHistory.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-base font-semibold text-slate-900">{item.id}</p>
                <p className="text-xs text-slate-500">{item.date}</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(item.status)}`}
              >
                {item.status}
              </span>
            </div>
            <p className="mt-2 text-base text-slate-700">Airport: {item.airport}</p>
            <p className="mt-1 text-base text-slate-700">Destination: {item.destination}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
