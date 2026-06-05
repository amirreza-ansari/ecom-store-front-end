import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  removeFromWishlist as removeFromWishlistAction,
  setWishlist,
} from "../features/wishlist/wishlistSlice";
import {
  getWishlist,
  removeFromWishlist,
} from "../features/wishlist/wishlistApi";
import { addToCart as addToCartApi } from "../features/cart/cartApi";
import { setCart } from "../features/cart/cartSlice";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { HiHeart, HiShoppingCart } from "react-icons/hi2";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const { items: wishlistIds } = useAppSelector((state) => state.wishlist);
  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const { data } = await getWishlist();
      setProducts(data.data.wishlist || []);
      dispatch(setWishlist((data.data.wishlist || []).map((p) => p._id)));
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleRemove = async (productId, productName) => {
    try {
      await removeFromWishlist(productId);
      dispatch(removeFromWishlistAction(productId));
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success(`${productName} removed from wishlist`);
    } catch (error) {
      toast.error("Failed to remove from wishlist");
    }
  };

  const handleAddToCart = async (product) => {
    setAddingToCart((prev) => ({ ...prev, [product._id]: true }));
    try {
      const { data } = await addToCartApi({
        productId: product._id,
        quantity: 1,
      });
      dispatch(setCart(data.data.cart));
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product._id]: false }));
    }
  };

  const handleAddAllToCart = async () => {
    const availableProducts = products.filter((p) => p.stock > 0);
    if (availableProducts.length === 0) {
      toast.error("No items currently available to add");
      return;
    }

    // Process items efficiently
    for (const product of availableProducts) {
      await handleAddToCart(product);
    }
  };

  if (fetching) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Spinner size='lg' />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className='max-w-7xl mx-auto px-6 py-20 text-center'>
        <HiHeart className='w-20 h-20 text-gray-200 mx-auto mb-6' />
        <h1 className='text-2xl font-extrabold text-gray-900 mb-2'>
          Your wishlist is empty
        </h1>
        <p className='text-gray-500 max-w-sm mx-auto mb-8 text-sm leading-relaxed'>
          Save items you love to your wishlist and come back to them anytime.
        </p>
        <Link to='/shop'>
          <Button
            variant='primary'
            size='lg'
            className='rounded-xl font-bold px-8'
          >
            Discover Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-6 py-8 font-sans animate-fade-in'>
      {/* Breadcrumb Navigation Trail */}
      <nav className='text-xs text-gray-400 mb-3 flex items-center gap-1.5 font-medium'>
        <Link to='/' className='hover:text-gray-900 transition-colors'>
          Home
        </Link>
        <span>&gt;</span>
        <span className='text-gray-600 font-semibold'>Wishlist</span>
      </nav>

      {/* Header Container */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2'>
            My Wishlist{" "}
            <span className='text-gray-400 font-normal text-xl sm:text-2xl'>
              ({products.length})
            </span>
          </h1>
        </div>
        <button
          onClick={handleAddAllToCart}
          className='text-xs sm:text-sm text-gray-900 font-bold border border-gray-200 bg-white shadow-sm rounded-xl px-5 py-2.5 hover:bg-gray-50 transition-all active:scale-[0.98]'
        >
          Move All to Cart
        </button>
      </div>

      {/* Products Grid matches image_9b419a.jpg clean vertical alignment */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6'>
        {products.map((product) => {
          const imageUrl =
            product.images?.[0]?.url ||
            "https://via.placeholder.com/300x300?text=No+Image";

          return (
            <div
              key={product._id}
              className='group relative bg-[#F8F9FA] rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg hover:bg-[#F3F4F6] transition-all duration-300 border border-transparent'
            >
              {/* Top Row Asset Layout */}
              <div className='relative w-full aspect-square mb-4 flex items-center justify-center'>
                <Link
                  to={`/product/${product.slug}`}
                  className='w-full h-full flex items-center justify-center'
                >
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className='max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]'
                  />
                </Link>

                {/* Heart Toggle acting as direct remove button */}
                <button
                  onClick={() => handleRemove(product._id, product.name)}
                  className='absolute top-0 right-0 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200 z-10'
                  title='Remove from Wishlist'
                >
                  <HiHeart className='w-5 h-5 text-red-500 drop-shadow-sm' />
                </button>

                {/* Out of Stock Mask Layer */}
                {product.stock === 0 && (
                  <div className='absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl'>
                    <span className='bg-gray-900 text-white text-[10px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-full shadow-sm'>
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {/* Text Meta Descriptions */}
              <div className='flex-1 flex flex-col justify-between'>
                <div className='mb-4'>
                  <Link
                    to={`/product/${product.slug}`}
                    className='block text-sm sm:text-base font-extrabold text-gray-900 truncate mb-1 hover:text-gray-600 transition-colors'
                  >
                    {product.name}
                  </Link>

                  {/* Subtle Subtext Brand Element */}
                  <p className='text-xs text-gray-400 font-medium truncate mb-2'>
                    {product.brand || "Generic"}
                  </p>

                  <div className='flex items-baseline gap-2'>
                    <span className='text-base sm:text-lg font-black text-gray-900'>
                      ${product.price?.toFixed(2)}
                    </span>
                    {product.comparePrice &&
                      product.comparePrice > product.price && (
                        <span className='text-xs sm:text-sm text-gray-400 line-through font-medium'>
                          ${product.comparePrice?.toFixed(2)}
                        </span>
                      )}
                  </div>

                  {product.stock > 0 && product.stock <= 5 && (
                    <p className='text-[10px] text-red-600 font-bold tracking-wide mt-1'>
                      Only {product.stock} left!
                    </p>
                  )}
                </div>

                {/* Bottom Core Call To Actions */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0 || addingToCart[product._id]}
                  className='w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200/80 hover:border-gray-300 text-gray-900 text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.99]'
                >
                  {addingToCart[product._id] ? (
                    <span className='flex items-center gap-2'>
                      <span className='w-3.5 h-3.5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin' />
                      Adding...
                    </span>
                  ) : (
                    <>
                      <HiShoppingCart className='w-4 h-4 text-gray-700' />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
