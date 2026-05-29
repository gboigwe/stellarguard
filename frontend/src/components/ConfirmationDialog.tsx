"use client";

import { useEffect, useId } from "react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Optional transaction details shown so users can verify before confirming */
  txDetails?: {
    txId: number;
    amount: string;   // pre-formatted, e.g. "42.50 XLM"
    recipient: string; // pre-formatted address
  };
}

export function ConfirmationDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isConfirming = false,
  onConfirm,
  onCancel,
  txDetails,
}: ConfirmationDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isConfirming) {
        onCancel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isConfirming, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="presentation"
      onClick={() => {
        if (!isConfirming) {
          onCancel();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md card"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id={titleId} className="text-lg font-semibold text-white">
          {title}
        </h3>
        <p id={descriptionId} className="text-sm text-gray-300 mt-2">
          {description}
        </p>

        {/* Transaction details so users can verify before confirming (issue #343) */}
        {txDetails && (
          <dl className="mt-4 rounded-lg bg-white/5 border border-white/10 divide-y divide-white/10 text-sm">
            <div className="flex justify-between px-4 py-2.5">
              <dt className="text-gray-400">Transaction</dt>
              <dd className="text-white font-mono">#{txDetails.txId}</dd>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <dt className="text-gray-400">Amount</dt>
              <dd className="text-white font-bold">{txDetails.amount}</dd>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <dt className="text-gray-400">Recipient</dt>
              <dd className="text-gray-200 font-mono">{txDetails.recipient}</dd>
            </div>
          </dl>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={onCancel}
            disabled={isConfirming}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn-primary text-sm"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
