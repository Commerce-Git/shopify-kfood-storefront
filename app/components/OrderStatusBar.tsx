"use client";

interface OrderStatusBarProps {
  step: number; // 0 = Placed, 1 = Processing, 2 = Shipped, 3 = Delivered
}

const STEPS = ["Order Placed", "Processing", "Shipped", "Delivered"];

export default function OrderStatusBar({ step }: OrderStatusBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200" />
        {/* Active line */}
        <div
          className="absolute top-3 left-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
          style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((label, i) => (
          <div key={label} className="relative flex flex-col items-center z-10">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                ${
                  i <= step
                    ? "bg-gradient-to-r from-orange-500 to-red-500 border-orange-500"
                    : "bg-white border-gray-300"
                }`}
            >
              {i <= step && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span
              className={`text-xs mt-2 whitespace-nowrap ${
                i <= step ? "text-orange-600 font-semibold" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
