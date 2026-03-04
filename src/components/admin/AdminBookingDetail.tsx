"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAdminBookingById } from "../../services/admin-booking.service";
import { AdminBookingContact, AdminBookingItem } from "./types";
import {
  AdminOrderProgress,
  getAdminOrderProgress,
  markOrderPaymentPaid,
} from "./storage";

type AdminBookingDetailProps = {
  bookingId: string;
};

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

function contactActionLabel(contact: AdminBookingContact) {
  const digits = contact.value.replace(/[^0-9]/g, "");
  if (contact.method === "whatsapp" && digits.length >= 8) return "TEL";
  return "VIEW";
}

function paymentStatusClass(status: AdminBookingItem["paymentStatus"]) {
  return status === "paid"
    ? "border-emerald-200 bg-emerald-100 text-emerald-800"
    : "border-rose-200 bg-rose-100 text-rose-800";
}

export function AdminBookingDetail({ bookingId }: AdminBookingDetailProps) {
  const [item, setItem] = useState<AdminBookingItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<AdminOrderProgress | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchAdminBookingById(bookingId);
        if (!mounted) return;
        setItem(data);
        const stored = getAdminOrderProgress();
        setProgress(stored[bookingId] ?? null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [bookingId]);

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <p className="text-base text-slate-600">Loading booking detail...</p>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h1 className="text-lg font-semibold text-slate-900">Booking not found</h1>
        <Link
          href="/admin"
          className="mt-3 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-base font-medium text-white"
        >
          Back to list
        </Link>
      </section>
    );
  }

  const resolvedPaymentStatus = progress?.paymentStatus ?? item.paymentStatus;
  const canConfirmPayment =
    Boolean(progress) && Boolean(receiptFile) && resolvedPaymentStatus !== "paid";

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Booking Detail</h1>
          <p className="text-base text-slate-600">ID: {item.id}</p>
        </div>
        <Link
          href="/admin"
          className="rounded-lg bg-slate-100 px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-200"
        >
          Back to list
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Customer</p>
          <p className="mt-1 text-base font-medium text-slate-900">{item.customerName}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Payment</p>
          <span
            className={`mt-1 inline-flex rounded-full border px-2 py-1 text-xs font-semibold uppercase ${paymentStatusClass(resolvedPaymentStatus)}`}
          >
            {resolvedPaymentStatus}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-3">
        <h2 className="text-lg font-semibold text-slate-900">Accepted Progress</h2>
        {progress ? (
          <div className="mt-2 grid gap-2 text-base text-slate-700 sm:grid-cols-2">
            <p>
              Accepted at:{" "}
              <span className="font-medium">
                {new Date(progress.acceptedAt).toLocaleString()}
              </span>
            </p>
            <p>
              Payment confirmed:{" "}
              <span className="font-medium">
                {progress.paymentConfirmedAt
                  ? new Date(progress.paymentConfirmedAt).toLocaleString()
                  : "-"}
              </span>
            </p>
          </div>
        ) : (
          <p className="mt-2 text-base text-slate-600">
            This order is not accepted yet. Go back to list and click Accept Order first.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 p-3">
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

      <div className="rounded-xl border border-slate-200 p-3">
        <h2 className="text-lg font-semibold text-slate-900">Contact Channels (Clickable)</h2>
        <p className="mt-1 text-sm text-slate-600">Click a contact card to open chat, call, or email.</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {item.contacts.map((contact) => (
            <a
              key={`${contact.method}-${contact.value}`}
              href={contactLink(contact)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-700 hover:bg-slate-100"
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

      <div className="rounded-xl border border-slate-200 p-3">
        <h2 className="text-lg font-semibold text-slate-900">Confirm Payment With Image</h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload payment slip after completing this accepted order.
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={(event) => setReceiptFile(event.target.files?.[0] ?? null)}
          className="mt-2 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:brightness-110"
        />

        <div className="mt-3">
          <button
            type="button"
            disabled={!canConfirmPayment}
            onClick={() => {
              const next = markOrderPaymentPaid(item.id);
              setProgress(next[item.id] ?? null);
              setReceiptFile(null);
            }}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </section>
  );
}
