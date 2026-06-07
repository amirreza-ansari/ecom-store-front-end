export default function PriceDisplay({
  price,
  comparePrice,
  size = "md",
  className = "",
}) {
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;
  const sizes = {
    sm: { price: "text-base", compare: "text-xs", badge: "text-xs" },
    md: { price: "text-xl", compare: "text-sm", badge: "text-xs" },
    lg: { price: "text-2xl", compare: "text-base", badge: "text-sm" },
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className={`font-bold text-[#0F1111] dark:text-white ${sizes[size].price}`}
      >
        ${price.toFixed(2)}
      </span>
      {hasDiscount && (
        <>
          <span
            className={`text-[#565959] dark:text-gray-400 line-through ${sizes[size].compare}`}
          >
            ${comparePrice.toFixed(2)}
          </span>
          <span className='bg-[#B12704] text-white px-1.5 py-0.5 rounded font-medium text-xs'>
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  );
}
