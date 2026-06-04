import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  setCart,
  clearCart as clearCartAction,
} from "../features/cart/cartSlice";
import {
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../features/cart/cartApi";
import QuantitySelector from "../components/ui/QuantitySelector";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { HiTrash, HiShoppingBag, HiArrowLeft } from "react-icons/hi2";
import toast from "react-hot-toast";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items, subtotal, total, totalItems, isLoading } = useAppSelector(
    (state) => state.cart,
  );
  const [fetching, setFetching] = useState(true);

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
      console.error("Failed to fetch cart:", error);
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
      toast.success(`${itemName} removed from cart`);
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to remove all items?")) return;
    try {
      await clearCart();
      dispatch(clearCartAction());
      toast.success("Cart cleared");
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  };

  if (fetching) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Spinner size='lg' />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className='max-w-7xl mx-auto px-4 py-16 text-center'>
        <HiShoppingBag className='w-24 h-24 text-[#D5D9D9] mx-auto mb-6' />
        <h1 className='text-2xl font-bold text-[#0F1111] mb-2'>
          Your cart is empty
        </h1>
        <p className='text-[#565959] mb-8'>
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link to='/shop'>
          <Button variant='primary' size='lg'>
            <HiArrowLeft className='w-5 h-5 mr-2' />
            Continue Shopping
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
          <h1 className='text-2xl font-bold text-[#0F1111]'>Shopping Cart</h1>
          <p className='text-sm text-[#565959] mt-1'>
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleClearCart}
          className='text-sm text-[#B12704] hover:underline'
        >
          Remove all
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Cart Items */}
        <div className='lg:col-span-2 space-y-4'>
          {items.map((item) => {
            const imageUrl =
              item.product?.images?.[0]?.url ||
              "https://via.placeholder.com/150x150?text=No+Image";
            const itemName = item.product?.name || "Unknown Product";
            const itemTotal = (item.price * item.quantity).toFixed(2);

            return (
              <div
                key={item._id}
                className='bg-white rounded-lg p-4 flex gap-4 shadow-sm'
              >
                {/* Image */}
                <Link
                  to={`/product/${item.product?.slug}`}
                  className='shrink-0'
                >
                  <img
                    src={imageUrl}
                    alt={itemName}
                    className='w-24 h-24 object-cover rounded-lg'
                  />
                </Link>

                {/* Details */}
                <div className='flex-1 min-w-0'>
                  <Link
                    to={`/product/${item.product?.slug}`}
                    className='text-sm font-medium text-[#0F1111] hover:text-[#FF9900] line-clamp-2 transition-colors'
                  >
                    {itemName}
                  </Link>

                  <p className='text-lg font-bold text-[#0F1111] mt-2'>
                    ${itemTotal}
                  </p>

                  <div className='flex items-center justify-between mt-3'>
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
                      className='text-sm text-[#565959] hover:text-[#B12704] flex items-center gap-1 transition-colors'
                    >
                      <HiTrash className='w-4 h-4' />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className='lg:col-span-1'>
          <div className='bg-white rounded-lg p-6 shadow-sm sticky top-24'>
            <h2 className='text-lg font-bold text-[#0F1111] mb-4'>
              Order Summary
            </h2>

            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-[#565959]'>
                  Subtotal ({totalItems} items)
                </span>
                <span className='font-medium'>${subtotal?.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-[#565959]'>Shipping</span>
                <span className='text-[#067D62] font-medium'>
                  Calculated at checkout
                </span>
              </div>
            </div>

            <div className='border-t border-[#D5D9D9] mt-4 pt-4'>
              <div className='flex justify-between text-lg font-bold text-[#0F1111]'>
                <span>Total</span>
                <span>${total?.toFixed(2)}</span>
              </div>
            </div>

            <Link to='/checkout'>
              <Button variant='primary' size='lg' className='w-full mt-6'>
                Proceed to Checkout
              </Button>
            </Link>

            <Link
              to='/shop'
              className='block text-center text-sm text-[#FF9900] hover:underline mt-4'
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
