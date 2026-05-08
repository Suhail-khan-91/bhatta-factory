"use client";

/**
 * Reusable StockIndicator component - displays fuel/ stock levels
 *
 * @param {number} stock - Current stock value
 * @param {number} threshold - Warning threshold (default: 20)
 * @param {string} label - Label text (default: "Available Stock")
 * @param {string} unit - Unit (default: "L")
 * @param {string} className - Additional wrapper classes
 */
export default function StockIndicator({
  stock,
  threshold = 20,
  label = "Available Stock",
  unit = "L",
  className = "",
}) {
  if (stock === null || stock === undefined) return null;

  const isLow = stock < threshold;
  const color = isLow ? "#ef4444" : "#22c55e";

  return (
    <p className={`text-sm font-semibold mt-1 ${className}`} style={{ color }}>
      ⛽ {label}: {stock}{unit}
    </p>
  );
}