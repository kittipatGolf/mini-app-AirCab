"use client";

import { useState } from "react";
import { AdminOrderProgress, markOrderCompleted, markOrderRejected } from "./storage";

type AdminOrderStatusControlProps = {
  bookingId: string;
  isAccepted: boolean;
  hasPaymentUpload: boolean;
  onProgressChange: (next: AdminOrderProgress | null) => void;
};

export function AdminOrderStatusControl({
  bookingId,
  isAccepted,
  hasPaymentUpload,
  onProgressChange,
}: AdminOrderStatusControlProps) {
  const [note, setNote] = useState("");
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultTone, setResultTone] = useState<"success" | "danger">("success");

  const isDisabled = !isAccepted;
  const isCompleteDisabled = isDisabled || !hasPaymentUpload;
  const noteValue = note.trim();

  const applyComplete = () => {
    if (isCompleteDisabled) return;
    const nextProgress = markOrderCompleted(bookingId, noteValue)[bookingId] ?? null;
    onProgressChange(nextProgress);
    setResultMessage("Job marked as completed.");
    setResultTone("success");
    setNote("");
  };

  const applyReject = () => {
    const nextProgress = markOrderRejected(bookingId, noteValue)[bookingId] ?? null;
    onProgressChange(nextProgress);
    setResultMessage("Order rejected and released for other drivers/admins to accept.");
    setResultTone("danger");
    setNote("");
    setIsRejectConfirmOpen(false);
  };

  return (
    <div className="relative rounded-xl border border-slate-200 p-3">
      <h2 className="text-lg font-semibold text-slate-900">Order Status Action</h2>
      <p className="mt-1 text-sm text-slate-600">
        Complete Job is available after uploading payment slip. Reject will release this order so
        others can accept it again.
      </p>

      <label className="mt-3 block text-sm text-slate-700">
        <span className="mb-1 block font-medium">Note (Optional)</span>
        <input
          value={note}
          disabled={isDisabled}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add note for this action"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isCompleteDisabled}
          onClick={applyComplete}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Complete Job
        </button>

        <button
          type="button"
          disabled={isDisabled}
          onClick={() => setIsRejectConfirmOpen(true)}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reject
        </button>

        {!isAccepted ? (
          <p className="self-center text-sm text-slate-600">
            This order has not been accepted yet. Please accept from booking list first.
          </p>
        ) : null}
        {isAccepted && !hasPaymentUpload ? (
          <p className="self-center text-sm text-slate-600">
            Upload payment slip first, then complete the job.
          </p>
        ) : null}
      </div>

      {resultMessage ? (
        <p
          className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
            resultTone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {resultMessage}
        </p>
      ) : null}

      {isRejectConfirmOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Confirm Rejection</h3>
            <p className="mt-1 text-sm text-slate-600">
              Rejecting will release this booking and make it available for others to accept.
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRejectConfirmOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyReject}
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:brightness-110"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
