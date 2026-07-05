"use client";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (newQuantity: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  const decrease = () => {
    if (quantity > min) onChange(quantity - 1);
  };

  const increase = () => {
    if (quantity < max) onChange(quantity + 1);
  };

  return (
    <div className="flex items-center border border-border-light rounded-lg overflow-hidden w-fit bg-white">
      <button
        onClick={decrease}
        disabled={quantity <= min}
        className="px-4 py-2 text-text hover:bg-surface-dim disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <div className="w-12 text-center font-medium text-dark text-sm">
        {quantity}
      </div>
      <button
        onClick={increase}
        disabled={quantity >= max}
        className="px-4 py-2 text-text hover:bg-surface-dim disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
