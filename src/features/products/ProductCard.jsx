import { Link } from "react-router-dom";
import StarRating from "../../components/ui/StarRating";
import PriceDisplay from "../../components/ui/PriceDisplay";
import Badge from "../../components/ui/Badge";

export default function ProductCard({ product }) {
  const imageUrl =
    product.images?.[0]?.url ||
    "https://via.placeholder.com/300x300?text=No+Image";

  return (
    <Link
      to={`/product/${product.slug}`}
      className='group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300'
    >
      {/* Image */}
      <div className='relative aspect-square overflow-hidden bg-[#F7FAFA]'>
        <img
          src={imageUrl}
          alt={product.name}
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
        />
        {product.isFeatured && (
          <Badge variant='warning' className='absolute top-2 left-2'>
            Featured
          </Badge>
        )}
        {product.stock === 0 && (
          <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
            <span className='text-white font-bold text-lg'>Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='p-4'>
        <p className='text-xs text-[#565959] mb-1'>
          {product.brand || "Generic"}
        </p>
        <h3 className='text-sm font-medium text-[#0F1111] line-clamp-2 mb-2 group-hover:text-[#FF9900] transition-colors'>
          {product.name}
        </h3>

        <StarRating rating={product.ratingsAverage} size='sm' />
        <span className='text-xs text-[#565959] ml-1'>
          ({product.ratingsQuantity})
        </span>

        <div className='mt-2'>
          <PriceDisplay
            price={product.price}
            comparePrice={product.comparePrice}
            size='sm'
          />
        </div>

        {product.stock > 0 && product.stock <= 10 && (
          <p className='text-xs text-[#B12704] mt-1'>
            Only {product.stock} left in stock
          </p>
        )}
      </div>
    </Link>
  );
}
