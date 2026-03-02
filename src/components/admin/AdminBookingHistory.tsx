"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAdminBookings } from "../../services/admin-booking.service";
import {
  AdminBookingContact,
  AdminBookingItem,
  AdminPaymentStatus,
} from "./types";
import {
  AdminOrderProgress,
  getAdminOrderProgress,
  markOrderPaymentPaid,
} from "./storage";

function contactLink(contact: AdminBookingContact) {
  const raw = contact.value.trim();
  const encoded = encodeURIComponent(raw);

  if (contact.method === "email") return `mailto:${raw}`;
  if (contact.method === "whatsapp") {
    const phone = raw.replace(/[^0-9]/g, "");
    return phone ? `https://wa.me/${phone}` : "https://wa.me/";
  }
  if (contact.method === "line") return `https://line.me/R/ti/p/~${encoded}`;
  return "https://web.wechat.com/";
}

function paymentStatusClass(status: AdminPaymentStatus) {
  return status === "paid"
    ? "bg-emerald-100 text-emerald-800"
    : "bg-rose-100 text-rose-800";
}

function contactActionLabel(contact: AdminBookingContact) {
  const digits = contact.value.replace(/[^0-9]/g, "");
  if (contact.method === "whatsapp" && digits.length >= 8) return "TEL";
  return "VIEW";
}

export function AdminBookingHistory() {
  const [items, setItems] = useState<AdminBookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<Record<string, AdminOrderProgress>>({});
  const [receiptById, setReceiptById] = useState<Record<string, File | null>>({});

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

  const acceptedItems = useMemo(() => {
    return items
      .filter((item) => Boolean(progress[item.id]))
      .sort((a, b) => progress[b.id].acceptedAt.localeCompare(progress[a.id].acceptedAt));
  }, [items, progress]);

  const handleConfirmPayment = (orderId: string) => {
    const next = markOrderPaymentPaid(orderId);
    setProgress(next);
    setReceiptById((prev) => ({ ...prev, [orderId]: null }));
  };

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <p className="text-base text-slate-600">Loading accepted orders...</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h1 className="text-xl font-semibold text-slate-900">Admin History</h1>
      <p className="text-base text-slate-600">
        Orders that you accepted. Upload and confirm payment when work is completed.
      </p>

      {acceptedItems.length === 0 ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-600">
          No accepted orders yet.
        </p>
      ) : null}

      <div className="mt-4 grid gap-3">
        {acceptedItems.map((item) => {
          const orderProgress = progress[item.id];
          const paymentStatus = orderProgress?.paymentStatus ?? item.paymentStatus;
          const receipt = receiptById[item.id] ?? null;
          const canConfirm = Boolean(receipt) && paymentStatus !== "paid";

          return (
            <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-slate-900">{item.id}</p>
                  <p className="text-sm text-slate-500">
                    Accepted at: {new Date(orderProgress.acceptedAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${paymentStatusClass(paymentStatus)}`}
                >
                  {paymentStatus}
                </span>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Customer</p>
                  <p className="mt-1 text-base font-medium text-slate-900">{item.customerName}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Payment</p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase ${paymentStatusClass(paymentStatus)}`}
                  >
                    {paymentStatus}
                  </span>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                <h2 className="text-lg font-semibold text-slate-900">Trip Information</h2>
                <div className="mt-2 grid gap-1 text-base text-slate-700 md:grid-cols-2">
                  <p>Airport: {item.airport}</p>
                  <p>Airline: {item.airline || "-"}</p>
                  <p>Flight Number: {item.flightNumber}</p>
                  <p>Landing: {item.landingDateTime}</p>
                  <p>Passengers: {item.passengers}</p>
                  <p>Destination: {item.destination}</p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                <h2 className="text-lg font-semibold text-slate-900">Contact Channels (Clickable)</h2>
                <p className="mt-1 text-sm text-slate-600">Click a contact card to open chat, call, or email.</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {item.contacts.map((contact) => (
                    <a
                      key={`${item.id}-${contact.method}-${contact.value}`}
                      href={contactLink(contact)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p>
                          {contact.method.toUpperCase()}: {contact.value}
                        </p>
                        <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                          {contactActionLabel(contact)}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                <h2 className="text-lg font-semibold text-slate-900">Confirm Payment With Image</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Upload payment slip after completing this order.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setReceiptById((prev) => ({ ...prev, [item.id]: file }));
                  }}
                  className="mt-2 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:brightness-110"
                />

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={!canConfirm}
                    onClick={() => handleConfirmPayment(item.id)}
                    className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Confirm Payment
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
