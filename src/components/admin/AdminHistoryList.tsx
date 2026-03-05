"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchAdminBookings } from "../../services/admin-booking.service";
import { AdminBookingItem } from "./types";
import { AdminOrderHistoryItem, getAdminOrderHistory } from "./storage";

function statusClass(status: AdminOrderHistoryItem["status"]) {
  return status === "completed"
    ? "border-emerald-200 bg-emerald-100 text-emerald-800"
    : "border-rose-200 bg-rose-100 text-rose-800";
}

function statusLabel(status: AdminOrderHistoryItem["status"]) {
  return status === "completed" ? "COMPLETED" : "REJECTED";
}

export function AdminHistoryList() {
  const [history, setHistory] = useState<AdminOrderHistoryItem[]>([]);
  const [bookings, setBookings] = useState<AdminBookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchAdminBookings();
        if (!mounted) return;
        setBookings(data.items);
        setHistory(getAdminOrderHistory());
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const bookingsMap = useMemo(
    () => new Map(bookings.map((booking) => [booking.id, booking])),
    [bookings]
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Admin History</h1>
        <p className="text-base text-slate-600">Track completed and rejected actions from booking detail.</p>
      </div>

      {isLoading ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-600">
          Loading history...
        </p>
      ) : null}

      {!isLoading && history.length === 0 ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-600">
          No history yet.
        </p>
      ) : null}

      <div className="mt-4 grid gap-3">
        {history.map((entry) => {
          const booking = bookingsMap.get(entry.orderId);
          return (
            <article
              key={entry.orderId}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-slate-900">{entry.orderId}</p>
                  <p className="text-sm text-slate-600">
                    Customer: {booking?.customerName ?? "Unknown customer"}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${statusClass(entry.status)}`}
                >
                  {statusLabel(entry.status)}
                </span>
              </div>

              <div className="mt-2 grid gap-1 text-sm text-slate-700 sm:grid-cols-2">
                <p>
                  Updated: <span className="font-medium">{new Date(entry.updatedAt).toLocaleString()}</span>
                </p>
                <p>
                  Note: <span className="font-medium">{entry.note || "-"}</span>
                </p>
              </div>

              <div className="mt-3">
                <Link
                  href={`/admin/bookings/${entry.orderId}?from=history`}
                  className="inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  View booking
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
