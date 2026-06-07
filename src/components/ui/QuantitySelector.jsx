import { HiMinus, HiPlus } from "react-icons/hi2";

export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99,
  size = "md",
}) {
  const sizes = {
    sm: "w-7 h-7 text-sm",
    md: "w-8 h-8 text-base",
  };

  return (
    <div className='flex items-center border border-[#D5D9D9] dark:border-gray-600 rounded-lg overflow-hidden'>
      <button
        onClick={onDecrease}
        disabled={quantity <= min}
        className={`${sizes[size]} flex items-center justify-center hover:bg-[#F7FAFA] dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[#0F1111] dark:text-white`}
      >
        <HiMinus className='w-3 h-3' />
      </button>
      <span
        className={`${sizes[size]} flex items-center justify-center font-medium text-[#0F1111] dark:text-white border-x border-[#D5D9D9] dark:border-gray-600 min-w-[40px]`}
      >
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        disabled={quantity >= max}
        className={`${sizes[size]} flex items-center justify-center hover:bg-[#F7FAFA] dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[#0F1111] dark:text-white`}
      >
        <HiPlus className='w-3 h-3' />
      </button>
    </div>
  );
}
