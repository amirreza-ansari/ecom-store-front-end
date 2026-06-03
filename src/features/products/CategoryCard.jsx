import { Link } from "react-router-dom";

const categoryColors = [
  "from-blue-400 to-blue-600",
  "from-green-400 to-green-600",
  "from-purple-400 to-purple-600",
  "from-orange-400 to-orange-600",
  "from-pink-400 to-pink-600",
  "from-teal-400 to-teal-600",
];

const categoryIcons = ["📱", "💻", "🎧", "⌚", "📷", "🎮"];

export default function CategoryCard({ category, index }) {
  const colorIndex = index % categoryColors.length;

  return (
    <Link
      to={`/shop?category=${category._id}`}
      className='group relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300'
    >
      <div
        className={`bg-gradient-to-br ${categoryColors[colorIndex]} p-6 h-40 flex flex-col justify-between`}
      >
        <span className='text-3xl'>{categoryIcons[colorIndex]}</span>
        <div>
          <h3 className='text-white font-bold text-lg'>{category.name}</h3>
          {category.subcategories?.length > 0 && (
            <p className='text-white/80 text-xs mt-1'>
              {category.subcategories.length} subcategories
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
