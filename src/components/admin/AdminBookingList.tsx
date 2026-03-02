"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchAdminBookings } from "../../services/admin-booking.service";
import { AdminBookingItem } from "./types";

function bookingStatusClass(status: AdminBookingItem["bookingStatus"]) {
  if (status === "arrived") return "bg-emerald-100 text-emerald-800";
  if (status === "assigned") return "bg-sky-100 text-sky-800";
  return "bg-amber-100 text-amber-800";
}

function paymentStatusClass(status: AdminBookingItem["paymentStatus"]) {
  return status === "paid"
    ? "bg-emerald-100 text-emerald-800"
    : "bg-rose-100 text-rose-800";
}

export function AdminBookingList() {
  const [items, setItems] = useState<AdminBookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchAdminBookings();
        if (mounted) setItems(data.items);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [items]
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Admin Booking List</h1>
        <p className="text-base text-slate-600">Manage incoming airport taxi bookings.</p>
      </div>

      {isLoading ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-600">
          Loading bookings...
        </p>
      ) : null}

      {!isLoading && sortedItems.length === 0 ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-600">
          No bookings found.
        </p>
      ) : null}

      <div className="mt-4 grid gap-3">
        {sortedItems.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-base font-semibold text-slate-900">{item.id}</p>
                <p className="text-base text-slate-600">{item.customerName}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${bookingStatusClass(item.bookingStatus)}`}
                >
                  {item.bookingStatus}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${paymentStatusClass(item.paymentStatus)}`}
                >
                  {item.paymentStatus}
                </span>
              </div>
            </div>

            <div className="mt-2 grid gap-1 text-base text-slate-700 sm:grid-cols-2">
              <p>Airport: {item.airport}</p>
              <p>Flight: {item.flightNumber}</p>
              <p>Landing: {item.landingDateTime}</p>
              <p>Destination: {item.destination}</p>
            </div>

            <div className="mt-3">
              <Link
                href={`/admin/bookings/${item.id}`}
                className="inline-flex rounded-lg bg-sky-600 px-3 py-2 text-base font-medium text-white transition hover:brightness-110"
              >
                View Item
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
