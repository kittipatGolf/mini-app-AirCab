"use client";

import { AdminPaymentStatus } from "./types";

export type AdminOrderProgress = {
  acceptedAt: string;
  paymentStatus: AdminPaymentStatus;
  paymentConfirmedAt?: string;
};

export const ADMIN_ORDER_PROGRESS_KEY = "aircab_admin_order_progress";

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

export function getAdminOrderProgress() {
  return readRawProgress();
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
