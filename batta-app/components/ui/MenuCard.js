"use client";

/**
 * Reusable MenuCard component - large clickable menu option
 *
 * @param {ReactNode} icon - Icon component
 * @param {string} title - Card title
 * @param {string} description - Optional description
 * @param {Function} onClick - Click handler
 * @param {string} gradient - Gradient classes (e.g., "from-pink-600 to-rose-700")
 * @param {string} borderColor - Border color (e.g., "border-pink-500/20")
 * @param {string} hoverGradient - Hover gradient classes
 * @param {string} className - Additional wrapper classes
 */
export default function MenuCard({
  icon: Icon,
  title,
  description,
  onClick,
  gradient = "from-pink-600 to-rose-700",
  borderColor = "border-pink-500/20",
  hoverGradient,
  className = "",
}) {
  const hoverClasses = hoverGradient ? `hover:from-${hoverGradient.split(' ')[0].replace('from-', '')} hover:to-${hoverGradient.split(' ')[1].replace('to-', '')}` : "";

  return (
    <button
      onClick={onClick}
      className={`
        bg-gradient-to-br ${gradient} ${hoverClasses}
        text-white p-6 rounded-2xl shadow-lg
        flex flex-col items-start gap-4
        active:scale-95 transition-all text-left group
        border ${borderColor}
        ${className}
      `}
    >
      {Icon && <Icon size={28} className="text-white/90" />}
      <div>
        <p className="font-semibold text-lg">{title}</p>
        {description && <p className="text-white/70 text-sm mt-1">{description}</p>}
      </div>
    </button>
  );
}