import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  setWishlist,
  removeFromWishlist as removeFromWishlistAction,
} from "../features/wishlist/wishlistSlice";
import {
  getWishlist,
  removeFromWishlist,
} from "../features/wishlist/wishlistApi";
import { addToCart as addToCartApi } from "../features/cart/cartApi";
import { setCart } from "../features/cart/cartSlice";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { HiHeart, HiShoppingCart, HiTrash } from "react-icons/hi2";
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
    for (const product of products) {
      if (product.stock > 0) {
        await handleAddToCart(product);
      }
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
      <div className='max-w-7xl mx-auto px-4 py-16 text-center'>
        <HiHeart className='w-24 h-24 text-[#D5D9D9] mx-auto mb-6' />
        <h1 className='text-2xl font-bold text-[#0F1111] mb-2'>
          Your wishlist is empty
        </h1>
        <p className='text-[#565959] mb-8'>
          Save items you love to your wishlist and come back to them anytime.
        </p>
        <Link to='/shop'>
          <Button variant='primary' size='lg'>
            Discover Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-2xl font-bold text-[#0F1111]'>My Wishlist</h1>
          <p className='text-sm text-[#565959] mt-1'>
            {products.length} item{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleAddAllToCart}
          className='text-sm text-[#FF9900] hover:underline font-medium'
        >
          Add all to cart
        </button>
      </div>

      {/* Products Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {products.map((product) => {
          const imageUrl =
            product.images?.[0]?.url ||
            "https://via.placeholder.com/300x300?text=No+Image";

          return (
            <div
              key={product._id}
              className='bg-white rounded-lg overflow-hidden shadow-sm group'
            >
              {/* Image */}
              <Link
                to={`/product/${product.slug}`}
                className='relative block aspect-square overflow-hidden bg-[#F7FAFA]'
              >
                <img
                  src={imageUrl}
                  alt={product.name}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                />
                {product.stock === 0 && (
                  <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
                    <span className='text-white font-bold text-lg'>
                      Out of Stock
                    </span>
                  </div>
                )}
              </Link>

              {/* Details */}
              <div className='p-4'>
                <p className='text-xs text-[#565959] mb-1'>
                  {product.brand || "Generic"}
                </p>
                <Link
                  to={`/product/${product.slug}`}
                  className='text-sm font-medium text-[#0F1111] line-clamp-2 hover:text-[#FF9900] transition-colors'
                >
                  {product.name}
                </Link>

                <div className='flex items-center gap-2 mt-2'>
                  <span className='text-lg font-bold text-[#0F1111]'>
                    ${product.price?.toFixed(2)}
                  </span>
                  {product.comparePrice &&
                    product.comparePrice > product.price && (
                      <span className='text-sm text-[#565959] line-through'>
                        ${product.comparePrice?.toFixed(2)}
                      </span>
                    )}
                </div>

                {product.stock > 0 && product.stock <= 10 && (
                  <p className='text-xs text-[#B12704] mt-1'>
                    Only {product.stock} left
                  </p>
                )}

                {/* Actions */}
                <div className='flex gap-2 mt-4'>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0 || addingToCart[product._id]}
                    className='flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#FF9900] text-white text-sm font-medium rounded-lg hover:bg-[#E88B00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    {addingToCart[product._id] ? (
                      "Adding..."
                    ) : (
                      <>
                        <HiShoppingCart className='w-4 h-4' />
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleRemove(product._id, product.name)}
                    className='p-2 border border-[#D5D9D9] rounded-lg hover:bg-[#F7FAFA] hover:text-[#B12704] transition-colors'
                  >
                    <HiTrash className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
