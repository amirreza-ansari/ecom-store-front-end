import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  fetchProductBySlug,
  clearCurrentProduct,
} from "../features/products/productSlice";
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
import Button from "../components/ui/Button";
import QuantitySelector from "../components/ui/QuantitySelector";
import Spinner from "../components/ui/Spinner";
import Pagination from "../components/ui/Pagination";
import {
  HiShoppingCart,
  HiHeart,
  HiHeart as HiHeartOutline,
  HiCheck,
  HiShieldCheck,
  HiTruck,
  HiHandThumbUp,
  HiPencil,
  HiTrash,
} from "react-icons/hi2";
import toast from "react-hot-toast";
import { reviewApi } from "../features/reviews/reviewApi";

export default function ProductPage() {
  const { slug } = useParams();
  const dispatch = useAppDispatch();
  const { currentProduct: product, isLoading } = useAppSelector(
    (state) => state.products,
  );
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsPagination, setReviewsPagination] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState("");
  const [editComment, setEditComment] = useState("");

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

  const fetchReviews = async (page = 1) => {
    if (!product) return;
    setReviewsLoading(true);
    try {
      const { data } = await reviewApi.getByProduct(product._id, {
        page,
        limit: 5,
        sort: "-createdAt",
      });
      setReviews(data.data.reviews);
      setReviewsPagination(data.pagination);
      setReviewsPage(page);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (product) fetchReviews();
  }, [product]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewError("Please write a review");
      return;
    }
    setReviewSubmitting(true);
    setReviewError("");
    try {
      await reviewApi.create(product._id, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setShowReviewForm(false);
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      toast.success("Review submitted!");
      fetchReviews();
    } catch (error) {
      setReviewError(
        error.response?.data?.message || "Failed to submit review",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review._id);
    setEditRating(review.rating);
    setEditTitle(review.title || "");
    setEditComment(review.comment);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      await reviewApi.update(editingReview, {
        rating: editRating,
        title: editTitle,
        comment: editComment,
      });
      setEditingReview(null);
      toast.success("Review updated!");
      fetchReviews(reviewsPage);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Delete your review?")) return;
    try {
      await reviewApi.delete(reviewId);
      toast.success("Review deleted");
      fetchReviews(reviewsPage);
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };
  const handleHelpful = async (reviewId) => {
    try {
      await reviewApi.markHelpful(reviewId);
      fetchReviews(reviewsPage);
      toast.success("Thanks for your feedback!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  if (isLoading)
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Spinner size='lg' />
      </div>
    );

  if (!product)
    return (
      <div className='text-center py-16'>
        <div className='text-6xl mb-4'>😕</div>
        <h2 className='text-xl font-semibold text-[#0F1111] dark:text-white mb-2'>
          Product not found
        </h2>
        <Link to='/shop' className='text-[#FF9900] hover:underline'>
          Back to shop
        </Link>
      </div>
    );

  return (
    <div className='max-w-7xl mx-auto px-4 py-6'>
      <nav className='text-sm text-[#565959] dark:text-gray-400 mb-4'>
        <Link to='/' className='hover:text-[#FF9900]'>
          Home
        </Link>
        <span className='mx-2'>/</span>
        <Link to='/shop' className='hover:text-[#FF9900]'>
          Shop
        </Link>
        <span className='mx-2'>/</span>
        <span className='text-[#0F1111] dark:text-white'>{product.name}</span>
      </nav>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div>
          <div className='bg-white dark:bg-gray-800 rounded-lg overflow-hidden mb-4 aspect-square'>
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
              <div className='w-full h-full flex items-center justify-center text-[#D5D9D9] dark:text-gray-600 text-6xl'>
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
                  className={`w-16 h-16 rounded-lg border-2 overflow-hidden shrink-0 transition-colors ${index === selectedImage ? "border-[#FF9900]" : "border-[#D5D9D9] dark:border-gray-600"}`}
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

        <div>
          <p className='text-sm text-[#565959] dark:text-gray-400 mb-1'>
            {product.brand || "Generic"}
          </p>
          <h1 className='text-2xl font-bold text-[#0F1111] dark:text-white mb-2'>
            {product.name}
          </h1>

          <div className='flex items-center gap-2 mb-4'>
            <StarRating rating={product.ratingsAverage} size='md' />
            <span className='text-sm text-[#565959] dark:text-gray-400'>
              ({product.ratingsQuantity} reviews)
            </span>
          </div>

          <div className='bg-[#F7FAFA] dark:bg-gray-800 rounded-lg p-4 mb-4'>
            <PriceDisplay
              price={currentPrice}
              comparePrice={currentComparePrice}
              size='lg'
            />
            {currentStock > 0 ? (
              <p className='text-sm text-[#067D62] dark:text-green-400 mt-1 flex items-center gap-1'>
                <HiCheck className='w-4 h-4' /> In Stock
                {currentStock <= 10 && (
                  <span className='text-[#B12704] dark:text-red-400'>
                    {" "}
                    - Only {currentStock} left
                  </span>
                )}
              </p>
            ) : (
              <p className='text-sm text-[#B12704] dark:text-red-400 mt-1'>
                Out of Stock
              </p>
            )}
          </div>

          {product.variants?.length > 0 && (
            <div className='mb-4'>
              <h3 className='text-sm font-bold text-[#0F1111] dark:text-white mb-2 uppercase'>
                Options
              </h3>
              <div className='flex flex-wrap gap-2'>
                <button
                  onClick={() => setSelectedVariant(null)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${!selectedVariant ? "border-[#FF9900] bg-[#FFF8F0] dark:bg-orange-900/20 text-[#FF9900] font-medium" : "border-[#D5D9D9] dark:border-gray-600 dark:text-gray-300 hover:border-[#FF9900]"}`}
                >
                  Default
                </button>
                {product.variants.map((variant) => (
                  <button
                    key={variant._id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${selectedVariant?._id === variant._id ? "border-[#FF9900] bg-[#FFF8F0] dark:bg-orange-900/20 text-[#FF9900] font-medium" : "border-[#D5D9D9] dark:border-gray-600 dark:text-gray-300 hover:border-[#FF9900]"}`}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
              {selectedVariant?.attributes && (
                <div className='flex flex-wrap gap-2 mt-3'>
                  {selectedVariant.attributes.map((attr) => (
                    <span
                      key={attr._id}
                      className='px-2 py-1 bg-[#F7FAFA] dark:bg-gray-700 rounded text-xs text-[#565959] dark:text-gray-300'
                    >
                      {attr.name}: <strong>{attr.value}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

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
              className='p-3 border border-[#D5D9D9] dark:border-gray-600 rounded-lg hover:bg-[#F7FAFA] dark:hover:bg-gray-700 transition-colors'
            >
              {isInWishlist ? (
                <HiHeart className='w-6 h-6 text-[#B12704]' />
              ) : (
                <HiHeartOutline className='w-6 h-6 text-[#565959] dark:text-gray-400' />
              )}
            </button>
          </div>

          <div className='flex gap-4 text-xs text-[#565959] dark:text-gray-400 border-t border-[#D5D9D9] dark:border-gray-700 pt-4'>
            <span className='flex items-center gap-1'>
              <HiShieldCheck className='w-4 h-4' /> Secure Payment
            </span>
            <span className='flex items-center gap-1'>
              <HiTruck className='w-4 h-4' /> Free Shipping over $100
            </span>
          </div>
        </div>
      </div>

      <div className='mt-12 bg-white dark:bg-gray-800 rounded-lg'>
        <div className='border-b border-[#D5D9D9] dark:border-gray-700'>
          <div className='flex gap-6 px-6'>
            {["description", "specifications", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? "border-[#FF9900] text-[#FF9900]" : "border-transparent text-[#565959] dark:text-gray-400 hover:text-[#0F1111] dark:hover:text-white"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className='p-6'>
          {activeTab === "description" && (
            <p className='text-[#0F1111] dark:text-gray-200 leading-relaxed whitespace-pre-line'>
              {product.description}
            </p>
          )}

          {activeTab === "specifications" &&
            (product.specifications?.length > 0 ? (
              <table className='w-full text-sm'>
                <tbody>
                  {product.specifications.map((spec) => (
                    <tr
                      key={spec._id}
                      className='border-b border-[#D5D9D9] dark:border-gray-700'
                    >
                      <td className='py-2 pr-4 font-medium text-[#0F1111] dark:text-white w-40'>
                        {spec.name}
                      </td>
                      <td className='py-2 text-[#565959] dark:text-gray-400'>
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className='text-[#565959] dark:text-gray-400'>
                No specifications available.
              </p>
            ))}

          {activeTab === "reviews" && (
            <div>
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-4'>
                  <StarRating rating={product.ratingsAverage} size='lg' />
                  <span className='text-sm text-[#565959] dark:text-gray-400'>
                    {product.ratingsQuantity} review
                    {product.ratingsQuantity !== 1 ? "s" : ""}
                  </span>
                </div>
                {isAuthenticated && !showReviewForm && !editingReview && (
                  <Button onClick={() => setShowReviewForm(true)} size='sm'>
                    Write a Review
                  </Button>
                )}
              </div>

              {showReviewForm && (
                <form
                  onSubmit={handleSubmitReview}
                  className='bg-[#F7FAFA] dark:bg-gray-700 rounded-lg p-4 mb-4 space-y-4'
                >
                  <h3 className='font-semibold text-[#0F1111] dark:text-white'>
                    Write a Review
                  </h3>
                  {reviewError && (
                    <div className='p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-[#B12704] dark:text-red-400'>
                      {reviewError}
                    </div>
                  )}
                  <div>
                    <label className='block text-sm mb-1 dark:text-gray-300'>
                      Rating
                    </label>
                    <StarRating
                      rating={reviewRating}
                      interactive
                      onChange={setReviewRating}
                      size='md'
                    />
                  </div>
                  <div>
                    <label className='block text-sm mb-1 dark:text-gray-300'>
                      Title (optional)
                    </label>
                    <input
                      type='text'
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder='Summarize your review'
                      maxLength={100}
                      className='w-full px-4 py-2.5 text-sm border border-[#D5D9D9] dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg'
                    />
                  </div>
                  <div>
                    <label className='block text-sm mb-1 dark:text-gray-300'>
                      Review *
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder='Share your experience...'
                      rows={3}
                      maxLength={1000}
                      className='w-full px-4 py-2.5 text-sm border border-[#D5D9D9] dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg resize-none'
                    />
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      type='submit'
                      variant='primary'
                      size='sm'
                      disabled={reviewSubmitting}
                    >
                      {reviewSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {reviewsLoading ? (
                <Spinner className='py-8' />
              ) : reviews.length > 0 ? (
                <div className='space-y-4'>
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className='border-b border-[#D5D9D9] dark:border-gray-700 pb-4 last:border-0'
                    >
                      {editingReview === review._id ? (
                        <form
                          onSubmit={handleUpdateReview}
                          className='bg-[#F7FAFA] dark:bg-gray-700 rounded-lg p-4 space-y-3'
                        >
                          <div>
                            <label className='block text-sm mb-1 dark:text-gray-300'>
                              Rating
                            </label>
                            <StarRating
                              rating={editRating}
                              interactive
                              onChange={setEditRating}
                              size='md'
                            />
                          </div>
                          <input
                            type='text'
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className='w-full px-3 py-2 text-sm border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg'
                          />
                          <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            rows={3}
                            className='w-full px-3 py-2 text-sm border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg resize-none'
                          />
                          <div className='flex gap-2'>
                            <Button type='submit' variant='primary' size='sm'>
                              Save
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => setEditingReview(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className='flex items-start gap-3'>
                            <div className='w-8 h-8 bg-[#FFA41C] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0'>
                              {review.user?.name?.charAt(0)?.toUpperCase() ||
                                "?"}
                            </div>
                            <div className='flex-1'>
                              <p className='text-sm font-medium text-[#0F1111] dark:text-white'>
                                {review.user?.name || "Anonymous"}
                              </p>
                              <StarRating
                                rating={review.rating}
                                size='sm'
                                showValue={false}
                              />
                              {review.title && (
                                <p className='text-sm font-medium text-[#0F1111] dark:text-white mt-1'>
                                  {review.title}
                                </p>
                              )}
                              <p className='text-sm text-[#565959] dark:text-gray-400 mt-1'>
                                {review.comment}
                              </p>
                              <p className='text-xs text-[#565959] dark:text-gray-500 mt-2'>
                                {new Date(
                                  review.createdAt,
                                ).toLocaleDateString()}
                              </p>
                              <div className='flex items-center gap-4 mt-2'>
                                <button
                                  onClick={() => handleHelpful(review._id)}
                                  className='flex items-center gap-1 text-xs text-[#565959] dark:text-gray-400 hover:text-[#FF9900]'
                                >
                                  <HiHandThumbUp className='w-3 h-3' /> Helpful
                                  ({review.helpfulCount || 0})
                                </button>
                                {review.user?._id === user?._id && (
                                  <>
                                    <button
                                      onClick={() => handleEditReview(review)}
                                      className='text-xs text-[#565959] dark:text-gray-400 hover:text-[#FF9900]'
                                    >
                                      <HiPencil className='w-3 h-3 inline mr-1' />{" "}
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteReview(review._id)
                                      }
                                      className='text-xs text-[#565959] dark:text-gray-400 hover:text-[#B12704] dark:hover:text-red-400'
                                    >
                                      <HiTrash className='w-3 h-3 inline mr-1' />{" "}
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {reviewsPagination && reviewsPagination.pages > 1 && (
                    <div className='mt-4'>
                      <Pagination
                        currentPage={reviewsPage}
                        totalPages={reviewsPagination.pages}
                        onPageChange={fetchReviews}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className='text-[#565959] dark:text-gray-400 text-sm text-center py-8'>
                  No reviews yet. Be the first to review!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
