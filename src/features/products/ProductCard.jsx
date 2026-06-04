import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { addToCart as addToCartApi } from "../cart/cartApi";
import { setCart } from "../cart/cartSlice";
import StarRating from "../../components/ui/StarRating";
import PriceDisplay from "../../components/ui/PriceDisplay";
import Badge from "../../components/ui/Badge";
import {
  HiShoppingCart,
  HiHeart,
  HiHeart as HiHeartOutline,
  HiEye,
} from "react-icons/hi2";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);

  const [isHovered, setIsHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const imageUrl =
    product.images?.[0]?.url ||
    "https://via.placeholder.com/300x300?text=No+Image";
  const isInWishlist = wishlistItems.includes(product._id);
  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) * 100,
        )
      : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    if (product.stock === 0) return;

    setAddingToCart(true);
    try {
      const { data } = await addToCartApi({
        productId: product._id,
        quantity: 1,
      });
      dispatch(setCart(data.data.cart));
      setAddedToCart(true);
      toast.success("Added to cart!");
      setTimeout(() => setAddedToCart(false), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div
      className='group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link
        to={`/product/${product.slug}`}
        className='block relative aspect-square overflow-hidden bg-[#F7FAFA]'
      >
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
        />

        {/* Overlay on hover */}
        <div
          className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Badges */}
        <div className='absolute top-2 left-2 flex flex-col gap-1'>
          {product.isFeatured && (
            <Badge variant='warning' className='shadow-sm'>
              Featured
            </Badge>
          )}
          {discountPercent > 0 && (
            <Badge variant='danger' className='shadow-sm'>
              -{discountPercent}%
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isAuthenticated) {
              toast.error("Please sign in");
              return;
            }
            // Wishlist toggle handled by parent or here
          }}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-sm transition-all duration-300 ${
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          } ${isInWishlist ? "bg-[#B12704] text-white" : "bg-white text-[#565959] hover:text-[#B12704]"}`}
        >
          {isInWishlist ? (
            <HiHeart className='w-4 h-4' />
          ) : (
            <HiHeartOutline className='w-4 h-4' />
          )}
        </button>

        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
            <span className='text-white font-bold text-base tracking-wide'>
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Quick Actions - Slide up on hover */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-3 flex gap-2 transition-all duration-300 ${
            isHovered && product.stock > 0
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }`}
        >
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              addedToCart
                ? "bg-[#067D62] text-white"
                : "bg-[#FF9900] text-white hover:bg-[#E88B00] active:scale-95 shadow-lg"
            }`}
          >
            {addedToCart ? (
              "✓ Added!"
            ) : addingToCart ? (
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
            ) : (
              <>
                <HiShoppingCart className='w-4 h-4' />
                Add to Cart
              </>
            )}
          </button>
          <Link
            to={`/product/${product.slug}`}
            onClick={(e) => e.stopPropagation()}
            className='p-2.5 bg-white rounded-lg hover:bg-[#F7FAFA] transition-colors shadow-lg text-[#565959] hover:text-[#0F1111]'
          >
            <HiEye className='w-4 h-4' />
          </Link>
        </div>
      </Link>

      {/* Content */}
      <div className='p-4'>
        <p className='text-xs text-[#565959] mb-1 uppercase tracking-wide'>
          {product.brand || "Generic"}
        </p>
        <Link to={`/product/${product.slug}`}>
          <h3 className='text-sm font-medium text-[#0F1111] line-clamp-2 mb-2 group-hover:text-[#FF9900] transition-colors leading-snug'>
            {product.name}
          </h3>
        </Link>

        <div className='flex items-center gap-1 mb-2'>
          <StarRating
            rating={product.ratingsAverage}
            size='sm'
            showValue={false}
          />
          <span className='text-xs text-[#565959]'>
            ({product.ratingsQuantity || 0})
          </span>
        </div>

        <PriceDisplay
          price={product.price}
          comparePrice={product.comparePrice}
          size='sm'
        />

        {product.stock > 0 && product.stock <= 10 && (
          <p className='text-xs text-[#B12704] mt-1.5 font-medium'>
            Only {product.stock} left
          </p>
        )}

        {/* Color swatches placeholder */}
        {product.variants?.length > 0 && (
          <div className='flex gap-1 mt-2'>
            {product.variants.slice(0, 4).map((v, i) => (
              <div
                key={v._id || i}
                className='w-3 h-3 rounded-full border border-[#D5D9D9]'
                title={v.name}
              />
            ))}
            {product.variants.length > 4 && (
              <span className='text-[10px] text-[#565959]'>
                +{product.variants.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
