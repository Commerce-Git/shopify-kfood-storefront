"use client";

interface OrderStatusBarProps {
  step: number; // 0 = Ordered, 1 = Crafting, 2 = Packaging, 3 = In Transit, 4 = Delivered
  theme?: "dark" | "light";
}

const STEPS = [
  { label: "Ordered" },
  { label: "Crafting" },
  { label: "Packaging" },
  { label: "In Transit" },
  { label: "Delivered" },
];

export default function OrderStatusBar({ step, theme = "dark" }: OrderStatusBarProps) {
  const isDelivered = step >= STEPS.length - 1;
  const isDark = theme === "dark";

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {/* Track Container (aligned from center of first step to center of last step) */}
        <div className="absolute top-3 left-[10%] right-[10%] h-[2px] pointer-events-none">
          {/* Background track line */}
          <div className={`w-full h-full ${isDark ? "bg-white/15" : "bg-stone-200"}`} />
          {/* Active progress line */}
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${
              isDelivered
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-[#C77B4A] to-[#E07A5F]"
            }`}
            style={{ width: `${(Math.min(Math.max(step, 0), 4) / 4) * 100}%` }}
          />
        </div>

        {/* Step Nodes */}
        {STEPS.map((item, i) => {
          const isCompleted = i < step || (isDelivered && i === step);
          const isCurrent = i === step && !isDelivered;
          const isFuture = i > step;

          return (
            <div key={item.label} className="relative flex flex-col items-center z-10 flex-1">
              {/* Node Circle */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? isDelivered
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-[#C77B4A] text-white shadow-sm"
                    : isCurrent
                    ? isDark
                      ? "bg-[#C77B4A] ring-4 ring-[#C77B4A]/30 border-2 border-white shadow-md"
                      : "bg-[#C77B4A] ring-4 ring-[#C77B4A]/25 border-2 border-white shadow-md"
                    : isDark
                    ? "bg-[#13221C] border border-white/20"
                    : "bg-white border border-stone-300"
                }`}
              >
                {isCompleted ? (
                  <svg
                    className="w-3.5 h-3.5 text-white"
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
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                ) : (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isDark ? "bg-white/20" : "bg-stone-300"
                    }`}
                  />
                )}
              </div>

              {/* Step Label */}
              <span
                className={`text-[10px] sm:text-xs mt-2 font-medium whitespace-nowrap text-center leading-none transition-colors duration-200 ${
                  isCurrent
                    ? isDark
                      ? "text-[#E07A5F] font-bold"
                      : "text-[#C77B4A] font-bold"
                    : isCompleted
                    ? isDelivered
                      ? "text-emerald-500 font-semibold"
                      : isDark
                      ? "text-white/90 font-semibold"
                      : "text-stone-800 font-semibold"
                    : isDark
                    ? "text-white/35 font-normal"
                    : "text-stone-400 font-normal"
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
