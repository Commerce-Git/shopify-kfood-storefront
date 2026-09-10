"use client";

import React from "react";
import type { CheckoutBackup } from "@/app/components/CartProvider";

interface CartBackupModalProps {
  backup: CheckoutBackup;
  onRestore: () => void;
  onDismiss: () => void;
}

export default function CartBackupModal({
  backup,
  onRestore,
  onDismiss,
}: CartBackupModalProps) {
  return (
    <div className="bg-[#FDF9F3] border border-[#E8DFC8] rounded-2xl p-5 mb-8 text-left shadow-xs">
      <p className="text-sm font-bold text-[#18181B] mb-1">
        Didn&apos;t complete your purchase?
      </p>
      <p className="text-xs text-[#71717A] mb-4">
        Your previous cart ({backup.items.length}{" "}
        {backup.items.length === 1 ? "item" : "items"}) is saved.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRestore}
          className="flex-1 text-xs font-bold bg-[#C25E38] text-white px-4 py-2.5 rounded-xl hover:bg-[#A74B28] transition-all shadow-xs cursor-pointer"
        >
          Restore My Cart ⚡
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-medium text-[#71717A] hover:text-[#18181B] px-4 py-2.5 rounded-xl border border-[#E8DFC8] hover:bg-white transition-all cursor-pointer"
        >
          No Thanks
        </button>
      </div>
    </div>
  );
}
