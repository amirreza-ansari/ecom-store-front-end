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
      toast.success(`${productName} removed`);
    } catch (error) {
      toast.error("Failed to remove");
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
      toast.success(`${product.name} added!`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product._id]: false }));
    }
  };

  if (fetching)
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Spinner size='lg' />
      </div>
    );

  if (products.length === 0)
    return (
      <div className='max-w-7xl mx-auto px-6 py-20 text-center min-h-screen'>
        <HiHeart className='w-20 h-20 text-gray-200 dark:text-gray-600 mx-auto mb-6' />
        <h1 className='text-2xl font-extrabold text-gray-900 dark:text-white mb-2'>
          Your wishlist is empty
        </h1>
        <p className='text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8 text-sm'>
          Save items you love to your wishlist.
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

  return (
    <div className='max-w-7xl mx-auto px-6 py-8 font-sans animate-fade-in min-h-screen'>
      <nav className='text-xs text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-1.5 font-medium'>
        <Link
          to='/'
          className='hover:text-gray-900 dark:hover:text-white transition-colors'
        >
          Home
        </Link>
        <span>&gt;</span>
        <span className='text-gray-600 dark:text-gray-300 font-semibold'>
          Wishlist
        </span>
      </nav>

      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100 dark:border-gray-700'>
        <h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white'>
          My Wishlist{" "}
          <span className='text-gray-400 dark:text-gray-500 font-normal text-xl'>
            ({products.length})
          </span>
        </h1>
        <button
          onClick={() =>
            products
              .filter((p) => p.stock > 0)
              .forEach((p) => handleAddToCart(p))
          }
          className='text-xs sm:text-sm text-gray-900 dark:text-white font-bold border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all'
        >
          Move All to Cart
        </button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {products.map((product) => {
          const imageUrl =
            product.images?.[0]?.url ||
            "https://via.placeholder.com/300x300?text=No+Image";
          return (
            <div
              key={product._id}
              className='group relative bg-[#F8F9FA] dark:bg-gray-800 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg hover:bg-[#F3F4F6] dark:hover:bg-gray-700 transition-all duration-300 border border-transparent dark:border-gray-700'
            >
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
                <button
                  onClick={() => handleRemove(product._id, product.name)}
                  className='absolute top-0 right-0 p-1 text-red-500 z-10'
                >
                  <HiHeart className='w-5 h-5 drop-shadow-sm' />
                </button>
                {product.stock === 0 && (
                  <div className='absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl'>
                    <span className='bg-gray-900 dark:bg-white dark:text-gray-900 text-white text-[10px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-full'>
                      Sold Out
                    </span>
                  </div>
                )}
              </div>
              <div className='flex-1 flex flex-col justify-between'>
                <div className='mb-4'>
                  <Link
                    to={`/product/${product.slug}`}
                    className='block text-sm sm:text-base font-extrabold text-gray-900 dark:text-white truncate mb-1 hover:text-gray-600 dark:hover:text-gray-300'
                  >
                    {product.name}
                  </Link>
                  <p className='text-xs text-gray-400 dark:text-gray-500 font-medium truncate mb-2'>
                    {product.brand || "Generic"}
                  </p>
                  <div className='flex items-baseline gap-2'>
                    <span className='text-base sm:text-lg font-black text-gray-900 dark:text-white'>
                      ${product.price?.toFixed(2)}
                    </span>
                    {product.comparePrice &&
                      product.comparePrice > product.price && (
                        <span className='text-xs text-gray-400 dark:text-gray-500 line-through'>
                          ${product.comparePrice?.toFixed(2)}
                        </span>
                      )}
                  </div>
                  {product.stock > 0 && product.stock <= 5 && (
                    <p className='text-[10px] text-red-600 dark:text-red-400 font-bold mt-1'>
                      Only {product.stock} left!
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0 || addingToCart[product._id]}
                  className='w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-700 border border-gray-200/80 dark:border-gray-600 text-gray-900 dark:text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-40 transition-all'
                >
                  {addingToCart[product._id] ? (
                    <span className='flex items-center gap-2'>
                      <span className='w-3.5 h-3.5 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin' />
                      Adding...
                    </span>
                  ) : (
                    <>
                      <HiShoppingCart className='w-4 h-4' /> Add to Cart
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
