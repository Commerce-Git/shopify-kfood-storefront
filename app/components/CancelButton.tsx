"use client";

import { useState } from "react";
import { isCancelable, getCancelMinutesRemaining } from "@/lib/constants";

interface CancelButtonProps {
  orderId: string;
  orderNumber: string;
  processedAt: string;
  fulfillmentStatus: string;
  financialStatus: string;
  onCancelled?: () => void;
}

export default function CancelButton({
  orderId,
  orderNumber,
  processedAt,
  fulfillmentStatus,
  financialStatus,
  onCancelled,
}: CancelButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [refundAmount, setRefundAmount] = useState<string | null>(null);

  const isCancelled = ["CANCELLED", "REFUNDED", "VOIDED"].includes(financialStatus);
  const canCancel =
    !isCancelled && fulfillmentStatus === "UNFULFILLED" && isCancelable(processedAt);
  const minutesLeft = getCancelMinutesRemaining(processedAt);

  // Already cancelled — show status
  if (isCancelled) {
    return (
      <div className="bg-gray-50 border border-gray-200 px-4 py-4 rounded-xl text-sm text-center space-y-1">
        <p className="text-gray-700 font-medium">✅ This order has been cancelled.</p>
        <p className="text-gray-500">
          💳 Refund → Original payment method · 📅 5-10 business days
        </p>
      </div>
    );
  }

  // Just cancelled in this session
  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 px-4 py-4 rounded-xl text-sm text-center space-y-1">
        <p className="text-green-700 font-medium">
          ✅ Order has been cancelled and refunded.
        </p>
        {refundAmount && (
          <p className="text-green-600">
            💳 Refund: ${parseFloat(refundAmount).toFixed(2)} → Original payment
          </p>
        )}
        <p className="text-gray-500">📅 Expected: 5-10 business days</p>
      </div>
    );
  }

  // Can't cancel (time expired or already fulfilled)
  if (!canCancel) return null;

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    setShowModal(false); // Close modal immediately

    try {
      const res = await fetch("/api/cancel-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopify_order_id: orderId,
          order_number: orderNumber,
          processedAt,
          reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSuccess(true);
        setRefundAmount(data.refundAmount || null);
        onCancelled?.();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Loading state — shown after modal closes while API processes */}
      {loading && (
        <div className="bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl text-sm text-center text-amber-700">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-400 border-t-transparent" />
            <span>Processing cancellation and refund...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Cancel link — hidden while loading */}
      {!loading && !error && (
        <div className="text-center space-y-1">
          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 
              transition-colors"
          >
            Changed your mind? Cancel this order
          </button>
          <p className="text-xs text-gray-400">
            Free cancellation within {minutesLeft < 60 ? `${minutesLeft} min` : `${Math.floor(minutesLeft / 60)} hour${Math.floor(minutesLeft / 60) !== 1 ? "s" : ""}`} of purchase
          </p>
      </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-2">Cancel Order {orderNumber}?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. Your refund will be processed to the
              original payment method.
            </p>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl 
                focus:ring-2 focus:ring-red-500 focus:border-transparent 
                outline-none resize-none h-24 text-sm text-gray-900 mb-4"
            />


            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 
                  rounded-xl hover:bg-gray-50 transition-all"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-red-500 text-white font-semibold 
                  rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {loading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
