import { useState } from "react";
import { HiStar, HiStar as HiStarOutline } from "react-icons/hi2";

export default function StarRating({
  rating = 0,
  maxStars = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = true,
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const sizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
  const displayRating = hoverRating || rating;

  return (
    <div className='flex items-center gap-0.5'>
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const filled = starValue <= displayRating;
        return (
          <button
            key={index}
            type='button'
            disabled={!interactive}
            onClick={() => {
              if (interactive && onChange) onChange(starValue);
            }}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          >
            {filled ? (
              <HiStar className={`${sizes[size]} text-[#FFA41C]`} />
            ) : (
              <HiStarOutline
                className={`${sizes[size]} text-[#D5D9D9] dark:text-gray-500`}
              />
            )}
          </button>
        );
      })}
      {showValue && rating > 0 && (
        <span className='ml-1 text-sm text-[#0F1111] dark:text-gray-300 font-medium'>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
