import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  fetchProductBySlug,
  clearCurrentProduct,
} from "../features/products/productSlice";
import { useAppDispatch as useCartDispatch } from "../app/hooks";
import { addToCart as addToCartApi } from "../features/cart/cartApi";
import {
  addToWishlist as addToWishlistApi,
  removeFromWishlist as removeFromWishlistApi,
} from "../features/wishlist/wishlistApi";
import { setCart } from "../features/cart/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "../features/wishlist/wishlistSlice";
import StarRating from "../components/ui/StarRating";
import PriceDisplay from "../components/ui/PriceDisplay";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import QuantitySelector from "../components/ui/QuantitySelector";
import Spinner from "../components/ui/Spinner";
import {
  HiShoppingCart,
  HiHeart,
  HiHeart as HiHeartOutline,
  HiCheck,
  HiShieldCheck,
  HiTruck,
} from "react-icons/hi2";
import toast from "react-hot-toast";

export default function ProductPage() {
  const { slug } = useParams();
  const dispatch = useAppDispatch();
  const { currentProduct: product, isLoading } = useAppSelector(
    (state) => state.products,
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
    return () => dispatch(clearCurrentProduct());
  }, [dispatch, slug]);

  const isInWishlist = product ? wishlistItems.includes(product._id) : false;

  const currentPrice = selectedVariant?.price || product?.price;
  const currentComparePrice =
    selectedVariant?.comparePrice || product?.comparePrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product?.stock;
  const currentImages =
    selectedVariant?.images?.length > 0
      ? selectedVariant.images
      : product?.images || [];

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    setAddingToCart(true);
    try {
      const { data } = await addToCartApi({
        productId: product._id,
        variantId: selectedVariant?._id || null,
        quantity,
      });
      dispatch(setCart(data.data.cart));
      setAddedToCart(true);
      toast.success("Added to cart!");
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to use wishlist");
      return;
    }

    try {
      if (isInWishlist) {
        await removeFromWishlistApi(product._id);
        dispatch(removeFromWishlist(product._id));
        toast.success("Removed from wishlist");
      } else {
        await addToWishlistApi(product._id);
        dispatch(addToWishlist(product._id));
        toast.success("Added to wishlist");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Spinner size='lg' />
      </div>
    );
  }

  if (!product) {
    return (
      <div className='text-center py-16'>
        <div className='text-6xl mb-4'>😕</div>
        <h2 className='text-xl font-semibold text-[#0F1111] mb-2'>
          Product not found
        </h2>
        <Link to='/shop' className='text-[#FF9900] hover:underline'>
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-6'>
      {/* Breadcrumb */}
      <nav className='text-sm text-[#565959] mb-4'>
        <Link to='/' className='hover:text-[#FF9900]'>
          Home
        </Link>
        <span className='mx-2'>/</span>
        <Link to='/shop' className='hover:text-[#FF9900]'>
          Shop
        </Link>
        <span className='mx-2'>/</span>
        <span className='text-[#0F1111]'>{product.name}</span>
      </nav>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Images */}
        <div>
          <div className='bg-white rounded-lg overflow-hidden mb-4 aspect-square'>
            {currentImages.length > 0 ? (
              <img
                src={
                  currentImages[selectedImage]?.url ||
                  "https://via.placeholder.com/600x600?text=No+Image"
                }
                alt={product.name}
                className='w-full h-full object-contain p-4'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center text-[#D5D9D9] text-6xl'>
                📷
              </div>
            )}
          </div>

          {currentImages.length > 1 && (
            <div className='flex gap-2 overflow-x-auto pb-2'>
              {currentImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded-lg border-2 overflow-hidden shrink-0 transition-colors ${
                    index === selectedImage
                      ? "border-[#FF9900]"
                      : "border-[#D5D9D9]"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt || ""}
                    className='w-full h-full object-cover'
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className='text-sm text-[#565959] mb-1'>
            {product.brand || "Generic"}
          </p>
          <h1 className='text-2xl font-bold text-[#0F1111] mb-2'>
            {product.name}
          </h1>

          {/* Rating */}
          <div className='flex items-center gap-2 mb-4'>
            <StarRating rating={product.ratingsAverage} size='md' />
            <span className='text-sm text-[#565959]'>
              ({product.ratingsQuantity} reviews)
            </span>
          </div>

          {/* Price */}
          <div className='bg-[#F7FAFA] rounded-lg p-4 mb-4'>
            <PriceDisplay
              price={currentPrice}
              comparePrice={currentComparePrice}
              size='lg'
            />
            {currentStock > 0 ? (
              <p className='text-sm text-[#067D62] mt-1 flex items-center gap-1'>
                <HiCheck className='w-4 h-4' /> In Stock
                {currentStock <= 10 && (
                  <span className='text-[#B12704]'>
                    {" "}
                    - Only {currentStock} left
                  </span>
                )}
              </p>
            ) : (
              <p className='text-sm text-[#B12704] mt-1'>Out of Stock</p>
            )}
          </div>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className='mb-4'>
              <h3 className='text-sm font-bold text-[#0F1111] mb-2 uppercase'>
                Options
              </h3>
              <div className='flex flex-wrap gap-2'>
                <button
                  onClick={() => setSelectedVariant(null)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    !selectedVariant
                      ? "border-[#FF9900] bg-[#FFF8F0] text-[#FF9900] font-medium"
                      : "border-[#D5D9D9] hover:border-[#FF9900]"
                  }`}
                >
                  Default
                </button>
                {product.variants.map((variant) => (
                  <button
                    key={variant._id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      selectedVariant?._id === variant._id
                        ? "border-[#FF9900] bg-[#FFF8F0] text-[#FF9900] font-medium"
                        : "border-[#D5D9D9] hover:border-[#FF9900]"
                    }`}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>

              {/* Selected variant attributes */}
              {selectedVariant?.attributes && (
                <div className='flex flex-wrap gap-2 mt-3'>
                  {selectedVariant.attributes.map((attr) => (
                    <span
                      key={attr._id}
                      className='px-2 py-1 bg-[#F7FAFA] rounded text-xs text-[#565959]'
                    >
                      {attr.name}: <strong>{attr.value}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className='flex items-center gap-4 mb-4'>
            <QuantitySelector
              quantity={quantity}
              onIncrease={() =>
                setQuantity(Math.min(quantity + 1, currentStock))
              }
              onDecrease={() => setQuantity(Math.max(quantity - 1, 1))}
              max={currentStock}
              size='lg'
            />
            <Button
              onClick={handleAddToCart}
              disabled={currentStock === 0 || addingToCart}
              variant={addedToCart ? "success" : "primary"}
              size='lg'
              className='flex-1'
            >
              {addedToCart ? (
                <>
                  <HiCheck className='w-5 h-5 mr-2' /> Added!
                </>
              ) : addingToCart ? (
                "Adding..."
              ) : currentStock === 0 ? (
                "Out of Stock"
              ) : (
                <>
                  <HiShoppingCart className='w-5 h-5 mr-2' /> Add to Cart
                </>
              )}
            </Button>
            <button
              onClick={handleWishlist}
              className='p-3 border border-[#D5D9D9] rounded-lg hover:bg-[#F7FAFA] transition-colors'
            >
              {isInWishlist ? (
                <HiHeart className='w-6 h-6 text-[#B12704]' />
              ) : (
                <HiHeartOutline className='w-6 h-6 text-[#565959]' />
              )}
            </button>
          </div>

          {/* Trust badges */}
          <div className='flex gap-4 text-xs text-[#565959] border-t border-[#D5D9D9] pt-4'>
            <span className='flex items-center gap-1'>
              <HiShieldCheck className='w-4 h-4' /> Secure Payment
            </span>
            <span className='flex items-center gap-1'>
              <HiTruck className='w-4 h-4' /> Free Shipping over $100
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='mt-12 bg-white rounded-lg'>
        <div className='border-b border-[#D5D9D9]'>
          <div className='flex gap-6 px-6'>
            {["description", "specifications", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? "border-[#FF9900] text-[#FF9900]"
                    : "border-transparent text-[#565959] hover:text-[#0F1111]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className='p-6'>
          {activeTab === "description" && (
            <p className='text-[#0F1111] leading-relaxed whitespace-pre-line'>
              {product.description}
            </p>
          )}

          {activeTab === "specifications" &&
            (product.specifications?.length > 0 ? (
              <table className='w-full text-sm'>
                <tbody>
                  {product.specifications.map((spec) => (
                    <tr key={spec._id} className='border-b border-[#D5D9D9]'>
                      <td className='py-2 pr-4 font-medium text-[#0F1111] w-40'>
                        {spec.name}
                      </td>
                      <td className='py-2 text-[#565959]'>{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className='text-[#565959]'>No specifications available.</p>
            ))}

          {activeTab === "reviews" && (
            <div>
              <div className='flex items-center gap-4 mb-4'>
                <StarRating rating={product.ratingsAverage} size='lg' />
                <span className='text-sm text-[#565959]'>
                  {product.ratingsQuantity} review
                  {product.ratingsQuantity !== 1 ? "s" : ""}
                </span>
              </div>
              <p className='text-[#565959] text-sm'>
                Reviews will be loaded here in the reviews feature.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
