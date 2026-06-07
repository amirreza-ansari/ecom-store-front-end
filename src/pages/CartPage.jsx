import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  setCart,
  clearCart as clearCartAction,
  setCoupon,
  removeCoupon as removeCouponAction,
} from "../features/cart/cartSlice";
import {
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon as removeCouponApi,
} from "../features/cart/cartApi";
import QuantitySelector from "../components/ui/QuantitySelector";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import {
  HiOutlineTrash,
  HiOutlineShoppingBag,
  HiArrowLeft,
  HiOutlineTicket,
  HiXMark,
} from "react-icons/hi2";
import toast from "react-hot-toast";

export default function CartPage() {
  const dispatch = useAppDispatch();

  const { items, subtotal, total, totalItems, discount, coupon } =
    useAppSelector((state) => state.cart);
  const [fetching, setFetching] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const { data } = await getCart();
      if (data.data?.cart) {
        dispatch(setCart(data.data.cart));
      }
    } catch (error) {
      toast.error("Failed to sync cart data");
    } finally {
      setFetching(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      const { data } = await updateCartItem(itemId, { quantity: newQuantity });
      dispatch(setCart(data.data.cart));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId, itemName) => {
    try {
      await removeFromCart(itemId);
      const { data } = await getCart();
      dispatch(setCart(data.data.cart));
      toast.success(`${itemName} removed`);
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to empty your cart?")) return;
    try {
      await clearCart();
      dispatch(clearCartAction());
      toast.success("Your cart is now empty");
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");

    try {
      const code = couponCode.trim().toUpperCase();
      await applyCoupon({ code });
      const { data } = await getCart();
      dispatch(setCart(data.data.cart));

      dispatch(setCoupon({ code, discount: data.data.cart.discount }));
      setCouponCode("");
      toast.success("Savings applied!");
    } catch (error) {
      setCouponError(
        error.response?.data?.message || "Invalid or expired code",
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCouponApi();
      const { data } = await getCart();
      dispatch(setCart(data.data.cart));
      dispatch(removeCouponAction());
      toast.success("Coupon removed");
    } catch (error) {
      toast.error("Failed to remove coupon");
    }
  };

  if (fetching) {
    return (
      <div className='flex flex-col justify-center items-center min-h-[60vh] gap-3 bg-[#FAFAFA] dark:bg-slate-950 transition-colors duration-200'>
        <Spinner size='md' className='text-slate-900 dark:text-slate-100' />
        <p className='text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse'>
          Loading your cart...
        </p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className='max-w-2xl mx-auto px-4 py-16 text-center'>
        <div className='w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner'>
          <HiOutlineShoppingBag className='w-12 h-12 text-slate-300 dark:text-slate-700' />
        </div>
        <h1 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2'>
          Your cart is waiting
        </h1>
        <p className='text-sm text-slate-500 dark:text-slate-400 mb-8'>
          Looks like you haven't added any items to your cart yet. Discover
          something new today.
        </p>
        <Link to='/shop'>
          <Button
            variant='primary'
            className='px-6 py-3 rounded-lg font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-all shadow-md shadow-slate-900/10'
          >
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='max-w-5xl mx-auto px-4 sm:px-6 py-8 bg-[#FAFAFA] dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200'>
      {/* Header */}
      <div className='flex items-end justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>
            Your Cart
          </h1>
          <p className='text-sm font-medium text-slate-500 dark:text-slate-400 mt-1'>
            {totalItems} {totalItems === 1 ? "item" : "items"} ready for
            checkout
          </p>
        </div>
        <button
          onClick={handleClearCart}
          className='text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline transition-colors'
        >
          Clear all
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        {/* Left Column: Cart Items */}
        <div className='lg:col-span-8 space-y-3'>
          {items.map((item) => {
            const imageUrl =
              item.product?.images?.[0]?.url ||
              "https://via.placeholder.com/150x150?text=No+Image";
            const itemName = item.product?.name || "Unknown Product";
            const itemTotal = (item.price * item.quantity).toFixed(2);

            return (
              <div
                key={item._id}
                className='bg-white dark:bg-slate-900 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 shadow-[0_2px_12px_rgb(0,0,0,0.02)] border border-slate-100 dark:border-slate-800 transition-all hover:shadow-[0_2px_12px_rgb(0,0,0,0.05)]'
              >
                {/* Image Wrapper */}
                <Link
                  to={`/product/${item.product?.slug}`}
                  className='shrink-0 mx-auto sm:mx-0'
                >
                  <div className='w-24 h-24 rounded-xl bg-slate-50 dark:bg-white border border-slate-100 dark:border-slate-800 overflow-hidden'>
                    <img
                      src={imageUrl}
                      alt={itemName}
                      className='w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal'
                    />
                  </div>
                </Link>

                {/* Details & Actions */}
                <div className='flex-1 flex flex-col justify-between py-0.5'>
                  <div className='flex justify-between items-start gap-3'>
                    <Link
                      to={`/product/${item.product?.slug}`}
                      className='text-base font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 transition-colors'
                    >
                      {itemName}
                    </Link>
                    <p className='text-lg font-bold text-slate-900 dark:text-slate-100 shrink-0'>
                      ${itemTotal}
                    </p>
                  </div>

                  <div className='flex items-center justify-between mt-4 sm:mt-0'>
                    <QuantitySelector
                      quantity={item.quantity}
                      onIncrease={() =>
                        handleUpdateQuantity(item._id, item.quantity + 1)
                      }
                      onDecrease={() =>
                        handleUpdateQuantity(item._id, item.quantity - 1)
                      }
                    />
                    <button
                      onClick={() => handleRemoveItem(item._id, itemName)}
                      className='p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all flex items-center justify-center'
                      aria-label='Remove item'
                    >
                      <HiOutlineTrash className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Order Summary */}
        <div className='lg:col-span-4'>
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 sticky top-6'>
            <h2 className='text-base font-bold text-slate-900 dark:text-slate-100 mb-5'>
              Order Summary
            </h2>

            <div className='space-y-3 text-sm font-medium'>
              <div className='flex justify-between text-slate-500 dark:text-slate-400'>
                <span>Subtotal</span>
                <span className='text-slate-900 dark:text-slate-100'>
                  ${subtotal?.toFixed(2)}
                </span>
              </div>
              <div className='flex justify-between text-slate-500 dark:text-slate-400'>
                <span>Shipping</span>
                <span className='text-slate-400 dark:text-slate-500 italic'>
                  Calculated at checkout
                </span>
              </div>

              {/* Active Discount Display */}
              {discount > 0 && (
                <div className='flex justify-between text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-lg'>
                  <span className='flex items-center gap-1.5'>
                    <HiOutlineTicket className='w-3.5 h-3.5' />
                    Discount
                  </span>
                  <span className='font-bold'>-${discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className='border-t border-slate-100 dark:border-slate-800 mt-5 pt-5 mb-6'>
              <div className='flex justify-between items-end'>
                <span className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                  Total
                </span>
                <span className='text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100'>
                  ${total?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link to='/checkout' className='block mb-5'>
              <Button
                variant='primary'
                className='w-full py-3 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-md shadow-slate-900/10 dark:shadow-none transition-all'
              >
                Proceed to Checkout
              </Button>
            </Link>

            {/* Promo Code Entry */}
            <div className='bg-slate-50 dark:bg-slate-950 rounded-xl p-3 border border-slate-100 dark:border-slate-800'>
              {coupon ? (
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400'>
                      <HiOutlineTicket className='w-3.5 h-3.5' />
                    </div>
                    <div>
                      <p className='text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide'>
                        {coupon.code}
                      </p>
                      <p className='text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider'>
                        Code applied
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className='p-1 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors'
                  >
                    <HiXMark className='w-4 h-4' />
                  </button>
                </div>
              ) : (
                <div className='space-y-1.5'>
                  <label className='text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1'>
                    Promo Code
                  </label>

                  {/* UNIFIED INPUT + BUTTON CONTAINER */}
                  <div className='relative flex items-center'>
                    <input
                      type='text'
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleApplyCoupon()
                      }
                      placeholder='Enter code'
                      className='w-full pl-3 pr-20 py-2.5 text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase placeholder:normal-case placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 transition-all'
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className='absolute right-1 top-1 bottom-1 px-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-bold rounded-md disabled:opacity-50 transition-all'
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>

                  {couponError && (
                    <p className='text-xs font-medium text-rose-500 dark:text-rose-400 mt-1.5 ml-1'>
                      {couponError}
                    </p>
                  )}
                </div>
              )}
            </div>

            <Link
              to='/shop'
              className='group flex items-center justify-center gap-1.5 mt-5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors'
            >
              <HiArrowLeft className='w-3.5 h-3.5 transition-transform group-hover:-translate-x-1' />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
