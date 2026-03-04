"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchAdminBookings } from "../../services/admin-booking.service";
import { AdminBookingItem } from "./types";
import { getAdminOrderProgress, markOrderAccepted, AdminOrderProgress } from "./storage";

function bookingStatusClass(status: AdminBookingItem["bookingStatus"]) {
  if (status === "arrived") return "border-emerald-200 bg-emerald-100 text-emerald-800";
  if (status === "assigned") return "border-sky-200 bg-sky-100 text-sky-800";
  return "border-amber-200 bg-amber-100 text-amber-800";
}

function paymentStatusClass(status: AdminBookingItem["paymentStatus"]) {
  return status === "paid"
    ? "border-emerald-200 bg-emerald-100 text-emerald-800"
    : "border-rose-200 bg-rose-100 text-rose-800";
}

function formatCreatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function AdminBookingList() {
  const [items, setItems] = useState<AdminBookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<Record<string, AdminOrderProgress>>({});

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchAdminBookings();
        if (!mounted) return;
        setItems(data.items);
        setProgress(getAdminOrderProgress());
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
        {sortedItems.map((item) => {
          const orderProgress = progress[item.id];
          const resolvedBookingStatus: AdminBookingItem["bookingStatus"] = orderProgress
            ? "assigned"
            : item.bookingStatus;
          const resolvedPaymentStatus: AdminBookingItem["paymentStatus"] =
            orderProgress?.paymentStatus ?? item.paymentStatus;
          const isAccepted = Boolean(orderProgress);

          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="border-b border-slate-200/90 px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-bold text-slate-900">{item.id}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Created: {formatCreatedAt(item.createdAt)}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Customer
                      </span>
                      <p className="text-base font-semibold text-slate-900">{item.customerName}</p>
                    </div>
                  </div>

                  <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Booking Status
                      </p>
                      <span
                        className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${bookingStatusClass(resolvedBookingStatus)}`}
                      >
                        {resolvedBookingStatus}
                      </span>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Payment Status
                      </p>
                      <span
                        className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${paymentStatusClass(resolvedPaymentStatus)}`}
                      >
                        {resolvedPaymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 px-4 py-3 sm:grid-cols-2 sm:px-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Airport
                  </p>
                  <p className="mt-1 text-base text-slate-800">{item.airport}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Flight
                  </p>
                  <p className="mt-1 text-base text-slate-800">{item.flightNumber}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Landing
                  </p>
                  <p className="mt-1 text-base text-slate-800">{item.landingDateTime}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Destination
                  </p>
                  <p className="mt-1 text-base text-slate-800">{item.destination}</p>
                </div>
              </div>

              <div className="border-t border-slate-200/90 px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isAccepted}
                    onClick={() => setProgress(markOrderAccepted(item.id))}
                    className="inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-base font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-emerald-200 disabled:text-emerald-700"
                  >
                    {isAccepted ? "Accepted" : "Accept Order"}
                  </button>

                  {isAccepted ? (
                    <Link
                      href={`/admin/bookings/${item.id}`}
                      className="inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-base font-semibold text-white transition hover:brightness-110"
                    >
                      View
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
