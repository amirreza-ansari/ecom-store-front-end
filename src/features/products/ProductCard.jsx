import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { addToCart as addToCartApi } from "../cart/cartApi";
import { setCart } from "../cart/cartSlice";
import StarRating from "../../components/ui/StarRating";
import {
  HiShoppingCart,
  HiHeart,
  HiHeart as HiHeartOutline,
} from "react-icons/hi2";
import toast from "react-hot-toast";
import {
  addToWishlist as addToWishlistAction,
  removeFromWishlist as removeFromWishlistAction,
} from "../wishlist/wishlistSlice";
import {
  addToWishlist as addToWishlistApi,
  removeFromWishlist as removeFromWishlistApi,
} from "../wishlist/wishlistApi";

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
      toast.error("Please sign in");
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

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please sign in");
      return;
    }
    try {
      if (isInWishlist) {
        await removeFromWishlistApi(product._id);
        dispatch(removeFromWishlistAction(product._id));
      } else {
        await addToWishlistApi(product._id);
        dispatch(addToWishlistAction(product._id));
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div
      className='group relative bg-white rounded-xl overflow-hidden border border-[#D5D9D9] hover:border-[#FF9900] hover:shadow-lg transition-all duration-200'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <Link
        to={`/product/${product.slug}`}
        className='block relative overflow-hidden bg-[#F7FAFA]'
        style={{ paddingBottom: "100%" }}
      >
        <img
          src={imageUrl}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
        />

        {/* Badges */}
        <div className='absolute top-2 left-2 flex flex-col gap-1'>
          {product.isFeatured && (
            <span className='bg-[#FFA41C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm'>
              Top
            </span>
          )}
          {discountPercent > 0 && (
            <span className='bg-[#B12704] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm'>
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-all duration-200 z-10 ${
            isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
          } ${isInWishlist ? "bg-[#B12704] text-white" : "bg-white text-[#565959] hover:bg-[#FFF0F0] hover:text-[#B12704]"}`}
        >
          {isInWishlist ? (
            <HiHeart className='w-4 h-4' />
          ) : (
            <HiHeartOutline className='w-4 h-4' />
          )}
        </button>

        {/* Out of Stock */}
        {product.stock === 0 && (
          <div className='absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center'>
            <span className='bg-white/90 text-[#0F1111] text-xs font-bold px-3 py-1 rounded-full'>
              Sold Out
            </span>
          </div>
        )}

        {/* Quick Add */}
        {product.stock > 0 && (
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className={`absolute bottom-2 left-2 right-2 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 z-10 ${
              isHovered
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            } ${
              addedToCart
                ? "bg-[#067D62] text-white"
                : "bg-[#1a1a2e]/90 backdrop-blur-sm text-white hover:bg-[#FF9900]"
            }`}
          >
            {addedToCart ? (
              "✓ Added to Cart"
            ) : addingToCart ? (
              <span className='flex items-center justify-center gap-2'>
                <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                Adding...
              </span>
            ) : (
              <span className='flex items-center justify-center gap-1.5'>
                <HiShoppingCart className='w-4 h-4' /> Add to Cart
              </span>
            )}
          </button>
        )}
      </Link>

      {/* Content */}
      <Link to={`/product/${product.slug}`} className='block p-3'>
        <p className='text-[10px] text-[#565959] uppercase tracking-wider font-medium truncate'>
          {product.brand || "Generic"}
        </p>
        <h3 className='text-sm font-medium text-[#0F1111] line-clamp-2 mt-0.5 mb-1.5 group-hover:text-[#FF9900] transition-colors leading-snug'>
          {product.name}
        </h3>

        <div className='flex items-center gap-1.5 mb-1.5'>
          <StarRating
            rating={product.ratingsAverage}
            size='sm'
            showValue={false}
          />
          <span className='text-[10px] text-[#565959]'>
            ({product.ratingsQuantity || 0})
          </span>
        </div>

        <div className='flex items-baseline gap-2'>
          <span className='text-base font-bold text-[#0F1111]'>
            ${product.price?.toFixed(2)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className='text-xs text-[#565959] line-through'>
              ${product.comparePrice?.toFixed(2)}
            </span>
          )}
        </div>

        {product.stock > 0 && product.stock <= 5 && (
          <p className='text-[10px] text-[#B12704] mt-1.5 font-semibold'>
            Only {product.stock} left
          </p>
        )}
      </Link>
    </div>
  );
}
