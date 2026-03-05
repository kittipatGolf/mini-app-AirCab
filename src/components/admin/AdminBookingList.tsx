"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchAdminBookings } from "../../services/admin-booking.service";
import { AdminBookingItem } from "./types";
import {
  AdminOrderProgress,
  getAdminOrderHistory,
  getAdminOrderProgress,
  markOrderAccepted,
  markOrderCompleted,
  markOrderRejected,
} from "./storage";

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
  const [paymentSlipUpload, setPaymentSlipUpload] = useState<Record<string, File | null>>({});
  const [rejectedOrderIds, setRejectedOrderIds] = useState<Set<string>>(new Set());
  const [rejectConfirmOrderId, setRejectConfirmOrderId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchAdminBookings();
        if (!mounted) return;
        setItems(data.items);
        setProgress(getAdminOrderProgress());
        const history = getAdminOrderHistory();
        const rejectedIds = new Set(
          history.filter((entry) => entry.status === "rejected").map((entry) => entry.orderId)
        );
        setRejectedOrderIds(rejectedIds);
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
    () =>
      [...items]
        .filter((item) => !rejectedOrderIds.has(item.id))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [items, rejectedOrderIds]
  );

  const applyReject = (orderId: string) => {
    const nextProgress = markOrderRejected(orderId)[orderId] ?? null;
    setProgress((prev) => {
      const nextState = { ...prev };
      if (!nextProgress) {
        delete nextState[orderId];
        return nextState;
      }
      nextState[orderId] = nextProgress;
      return nextState;
    });
    setPaymentSlipUpload((prev) => ({
      ...prev,
      [orderId]: null,
    }));
    setRejectedOrderIds((prev) => {
      const next = new Set(prev);
      next.add(orderId);
      return next;
    });
    setRejectConfirmOrderId(null);
  };

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
                <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
                  <button
                    type="button"
                    disabled={isAccepted}
                    onClick={() => setProgress(markOrderAccepted(item.id))}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-emerald-200 disabled:text-emerald-700 sm:px-4 sm:py-2.5 sm:text-base"
                  >
                    {isAccepted ? "รับงานแล้ว" : "รับงาน"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectConfirmOrderId(item.id)}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 sm:px-4 sm:py-2.5 sm:text-base"
                  >
                    ปฏิเสธ
                  </button>

                  <Link
                    href={`/admin/bookings/${item.id}`}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 sm:px-4 sm:py-2.5 sm:text-base"
                  >
                    ดูรายละเอียด
                  </Link>
                </div>

                {isAccepted ? (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">อัปโหลดสลิปการชำระเงิน</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        ปุ่มเสร็จงานจะกดได้หลังจากอัปโหลดรูปสลิปการชำระเงินแล้วเท่านั้น
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          setPaymentSlipUpload((prev) => ({
                            ...prev,
                            [item.id]: event.target.files?.[0] ?? null,
                          }))
                        }
                        className="mt-2 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:brightness-110"
                      />
                    </div>

                    <div className="mt-3">
                      <button
                        type="button"
                        disabled={!paymentSlipUpload[item.id]}
                        onClick={() => {
                          const nextProgress = markOrderCompleted(item.id)[item.id] ?? null;
                          if (!nextProgress) return;
                          setProgress((prev) => ({
                            ...prev,
                            [item.id]: nextProgress,
                          }));
                          setPaymentSlipUpload((prev) => ({
                            ...prev,
                            [item.id]: null,
                          }));
                        }}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Complete Job
                      </button>
                      {!paymentSlipUpload[item.id] ? (
                        <p className="mt-2 text-sm text-slate-600">
                          กรุณาอัปโหลดสลิปการชำระเงินก่อน แล้วจึงกดเสร็จงาน
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {rejectConfirmOrderId ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">ยืนยันการปฏิเสธงาน</h3>
            <p className="mt-1 text-sm text-slate-600">
              เมื่อปฏิเสธแล้ว รายการนี้จะถูกลบออกจากหน้ารับงาน และย้ายไปที่ประวัติ
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectConfirmOrderId(null)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => applyReject(rejectConfirmOrderId)}
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:brightness-110"
              >
                ยืนยันปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
