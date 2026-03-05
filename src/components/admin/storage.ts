"use client";

import { AdminPaymentStatus } from "./types";

export type AdminOrderProgress = {
  acceptedAt: string;
  paymentStatus: AdminPaymentStatus;
  paymentConfirmedAt?: string;
};

export type AdminOrderStatus = "completed" | "rejected";

export type AdminOrderHistoryItem = {
  orderId: string;
  status: AdminOrderStatus;
  note?: string;
  updatedAt: string;
};

export const ADMIN_ORDER_PROGRESS_KEY = "aircab_admin_order_progress";
export const ADMIN_ORDER_HISTORY_KEY = "aircab_admin_order_history";

function readRawProgress(): Record<string, AdminOrderProgress> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(ADMIN_ORDER_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, AdminOrderProgress>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeRawProgress(value: Record<string, AdminOrderProgress>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_ORDER_PROGRESS_KEY, JSON.stringify(value));
}

function readRawHistory(): AdminOrderHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(ADMIN_ORDER_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Migrate legacy status "confirmed" -> "completed"
    const next: AdminOrderHistoryItem[] = [];
    for (const item of parsed) {
      const status =
        item?.status === "completed"
          ? "completed"
          : item?.status === "confirmed"
          ? "completed"
          : item?.status === "rejected"
            ? "rejected"
            : null;

      if (!status || typeof item?.orderId !== "string" || typeof item?.updatedAt !== "string") {
        continue;
      }

      next.push({
        orderId: item.orderId,
        status,
        note: typeof item?.note === "string" ? item.note : undefined,
        updatedAt: item.updatedAt,
      });
    }

    return next;
  } catch {
    return [];
  }
}

function writeRawHistory(value: AdminOrderHistoryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_ORDER_HISTORY_KEY, JSON.stringify(value));
}

function upsertOrderHistory(orderId: string, status: AdminOrderStatus, note?: string) {
  const history = readRawHistory();
  const nextItem: AdminOrderHistoryItem = {
    orderId,
    status,
    note: note?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  };
  const nextHistory = [nextItem, ...history.filter((entry) => entry.orderId !== orderId)];
  writeRawHistory(nextHistory);
  return nextHistory;
}

export function getAdminOrderProgress() {
  return readRawProgress();
}

export function getAdminOrderHistory() {
  return readRawHistory();
}

export function markOrderAccepted(orderId: string) {
  const progress = readRawProgress();
  const existing = progress[orderId];

  progress[orderId] = {
    acceptedAt: existing?.acceptedAt ?? new Date().toISOString(),
    paymentStatus: existing?.paymentStatus ?? "unpaid",
    paymentConfirmedAt: existing?.paymentConfirmedAt,
  };

  writeRawProgress(progress);
  return progress;
}

export function markOrderPaymentPaid(orderId: string) {
  const progress = readRawProgress();
  const existing = progress[orderId] ?? {
    acceptedAt: new Date().toISOString(),
    paymentStatus: "unpaid" as const,
  };

  progress[orderId] = {
    ...existing,
    paymentStatus: "paid",
    paymentConfirmedAt: new Date().toISOString(),
  };

  writeRawProgress(progress);
  return progress;
}

export function markOrderCompleted(orderId: string, note?: string) {
  const progress = readRawProgress();
  const existing = progress[orderId] ?? {
    acceptedAt: new Date().toISOString(),
    paymentStatus: "unpaid" as const,
  };

  progress[orderId] = {
    ...existing,
    paymentStatus: "paid",
    paymentConfirmedAt: existing.paymentConfirmedAt ?? new Date().toISOString(),
  };
  writeRawProgress(progress);
  upsertOrderHistory(orderId, "completed", note);
  return progress;
}

// Backward-compatible alias while UI text is migrated.
export const markOrderConfirmed = markOrderCompleted;

export function markOrderRejected(orderId: string, note?: string) {
  const progress = readRawProgress();
  delete progress[orderId];
  writeRawProgress(progress);
  upsertOrderHistory(orderId, "rejected", note);
  return progress;
}
