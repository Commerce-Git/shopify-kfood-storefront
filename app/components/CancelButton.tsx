"use client";

import { useState } from "react";
import { isCancelable, getCancelMinutesRemaining } from "@/lib/constants";

interface CancelButtonProps {
  orderId: string;
  orderNumber: string;
  processedAt: string;
  fulfillmentStatus: string;
  onCancelled?: () => void;
}

export default function CancelButton({
  orderId,
  orderNumber,
  processedAt,
  fulfillmentStatus,
  onCancelled,
}: CancelButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canCancel =
    fulfillmentStatus === "UNFULFILLED" && isCancelable(processedAt);
  const minutesLeft = getCancelMinutesRemaining(processedAt);

  if (!canCancel) return null;

  if (success) {
    return (
      <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm text-center">
        ✅ Cancellation request submitted. We&apos;ll process it shortly.
      </div>
    );
  }

  const handleCancel = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/cancel-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopify_order_id: orderId,
          order_number: orderNumber,
          reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSuccess(true);
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
      <div className="space-y-2">
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-3 px-4 border-2 border-red-200 text-red-600 font-semibold 
            rounded-xl hover:bg-red-50 transition-all"
        >
          ❌ Cancel This Order
        </button>
        <p className="text-xs text-gray-500 text-center">
          Free cancellation available for {minutesLeft} more minute
          {minutesLeft !== 1 ? "s" : ""}
        </p>
      </div>

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

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

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
