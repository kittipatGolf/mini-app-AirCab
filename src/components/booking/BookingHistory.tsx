"use client";

import { useState } from "react";
import { BookingHistoryItem } from "./types";
import { getBookingHistoryStorageKey, getClientAuth } from "../../lib/mock-user-auth";

function statusClass(status: BookingHistoryItem["status"]) {
  if (status === "Completed") return "bg-emerald-100 text-emerald-800";
  if (status === "Confirmed") return "bg-sky-100 text-sky-800";
  return "bg-amber-100 text-amber-800";
}

function readStoredHistory(): BookingHistoryItem[] {
  if (typeof window === "undefined") return [];
  const auth = getClientAuth();
  if (!auth.username) return [];

  try {
    const storageKey = getBookingHistoryStorageKey(auth.username);
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BookingHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function BookingHistory() {
  const [items] = useState<BookingHistoryItem[]>(readStoredHistory);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-slate-900">Booking History</h2>
      <p className="mt-1 text-base text-slate-600">รายการจองย้อนหลังของผู้ใช้งาน</p>

      {items.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-base text-slate-600">
          ยังไม่มีประวัติการจอง
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
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

              <dl className="mt-3 grid gap-2 text-base text-slate-700 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-500">Airport</dt>
                  <dd>{item.airport || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Flight Number</dt>
                  <dd>{item.flightNumber || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Airline</dt>
                  <dd>{item.airline || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Passengers</dt>
                  <dd>{item.passengers ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Landing Time</dt>
                  <dd>{[item.landingDate, item.landingTime].filter(Boolean).join(" ") || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Destination</dt>
                  <dd>{item.destination || "-"}</dd>
                </div>
              </dl>

              <div className="mt-2">
                <p className="text-sm text-slate-500">Contact</p>
                {item.contacts && item.contacts.length > 0 ? (
                  <div className="mt-1 space-y-1 text-base text-slate-700">
                    {item.contacts.map((contact, index) => (
                      <p key={`${item.id}-${contact.method}-${index}`}>
                        {contact.method}: {contact.value}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-base text-slate-700">-</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
