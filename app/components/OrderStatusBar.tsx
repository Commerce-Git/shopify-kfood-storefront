"use client";

interface OrderStatusBarProps {
  step: number; // 0 = Ordered, 1 = Crafting, 2 = Packaging, 3 = Shipped
}

const STEPS = [
  { label: "Ordered", emoji: "📝" },
  { label: "Crafting", emoji: "🎨" },
  { label: "Packaging", emoji: "📦" },
  { label: "Shipped", emoji: "✈️" }
];

export default function OrderStatusBar({ step }: OrderStatusBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-9 left-3 right-3 h-0.5 bg-gray-200" />
        {/* Active line */}
        <div
          className="absolute top-9 left-3 h-0.5 bg-gradient-to-r from-orange-500 to-indigo-500 transition-all duration-500"
          style={{ width: `calc(${(step / (STEPS.length - 1)) * 100}% - 24px)` }}
        />

        {STEPS.map((item, i) => (
          <div key={item.label} className="relative flex flex-col items-center z-10 flex-1">
            {/* Floating emoji above circle */}
            <div className="h-5 flex items-center justify-center mb-1">
              <span className="text-sm select-none">{item.emoji}</span>
            </div>

            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                ${
                  i <= step
                    ? "bg-gradient-to-r from-orange-500 to-indigo-500 border-orange-500"
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
              className={`text-xs mt-2 font-bold whitespace-nowrap leading-none ${
                i <= step ? "text-orange-600" : "text-gray-400"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
