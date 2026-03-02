"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { fetchAdminBookingById } from "../../services/admin-booking.service";
import { LogoutButton } from "../auth/LogoutButton";
import { AdminBookingContact, AdminBookingItem } from "./types";

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

function paymentStatusClass(status: AdminBookingItem["paymentStatus"]) {
  return status === "paid"
    ? "bg-emerald-100 text-emerald-800"
    : "bg-rose-100 text-rose-800";
}

export function AdminBookingDetail({ bookingId }: AdminBookingDetailProps) {
  const [item, setItem] = useState<AdminBookingItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchAdminBookingById(bookingId);
        if (mounted) setItem(data);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [bookingId]);

  useEffect(() => {
    if (!receiptFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(receiptFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [receiptFile]);

  const canConfirm = useMemo(() => Boolean(item && receiptFile), [item, receiptFile]);

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

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Booking Detail</h1>
          <p className="text-base text-slate-600">ID: {item.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="rounded-lg bg-slate-100 px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-200"
          >
            Back to list
          </Link>
          <LogoutButton className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Customer</p>
          <p className="mt-1 text-base font-medium text-slate-900">{item.customerName}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Payment</p>
          <span
            className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase ${paymentStatusClass(item.paymentStatus)}`}
          >
            {isConfirmed ? "paid (confirmed)" : item.paymentStatus}
          </span>
        </div>
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
        <h2 className="text-lg font-semibold text-slate-900">Contact Channels</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {item.contacts.map((contact) => (
            <a
              key={`${contact.method}-${contact.value}`}
              href={contactLink(contact)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-700 hover:bg-slate-100"
            >
              {contact.method.toUpperCase()}: {contact.value}
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-3">
        <h2 className="text-lg font-semibold text-slate-900">Confirm Payment With Image</h2>
        <p className="mt-1 text-base text-slate-600">
          Upload payment slip and confirm this booking.
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setReceiptFile(file);
            setIsConfirmed(false);
          }}
          className="mt-3 block w-full text-base text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-base file:font-medium file:text-white hover:file:brightness-110"
        />

        {previewUrl ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
            <Image
              src={previewUrl}
              alt="Payment receipt preview"
              className="h-64 w-full object-cover"
              width={1200}
              height={800}
              unoptimized
            />
          </div>
        ) : null}

        <button
          type="button"
          disabled={!canConfirm}
          onClick={() => setIsConfirmed(true)}
          className="mt-3 rounded-lg bg-sky-600 px-4 py-2 text-base font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Confirm Payment
        </button>

        {isConfirmed ? (
          <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-base text-emerald-700">
            Payment has been confirmed with receipt image.
          </p>
        ) : null}
      </div>
    </section>
  );
}
