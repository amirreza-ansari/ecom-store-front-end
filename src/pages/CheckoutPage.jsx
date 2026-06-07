import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { setCart } from "../features/cart/cartSlice";
import { getCart } from "../features/cart/cartApi";
import { addressApi } from "../features/users/addressApi";
import { orderApi } from "../features/orders/orderApi";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import {
  HiPlus,
  HiChevronLeft,
  HiShieldCheck,
  HiCreditCard,
} from "react-icons/hi2";
import toast from "react-hot-toast";
import PaymentModal from "../features/payment/PaymentModal";

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, subtotal, discount, shippingCost, total, totalItems } =
    useAppSelector((state) => state.cart);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPreparingPayment, setIsPreparingPayment] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    phone: "",
    isDefault: false,
  });
  const [editingAddress, setEditingAddress] = useState(null);
  const [editForm, setEditForm] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    phone: "",
  });
  const [showPayment, setShowPayment] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    fetchCartAndAddresses();
  }, []);

  const fetchCartAndAddresses = async () => {
    setLoading(true);
    try {
      const [cartRes, addrRes] = await Promise.all([
        getCart(),
        addressApi.getAll(),
      ]);
      dispatch(setCart(cartRes.data.data.cart));
      setAddresses(addrRes.data.data.addresses || []);
      const defaultAddr = addrRes.data.data.addresses?.find((a) => a.isDefault);
      if (defaultAddr) setSelectedAddress(defaultAddr._id);
      else if (addrRes.data.data.addresses?.length > 0)
        setSelectedAddress(addrRes.data.data.addresses[0]._id);
    } catch (error) {
      toast.error("Failed to load checkout data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await addressApi.add(newAddress);
      setAddresses((prev) => [...prev, data.data.address]);
      setSelectedAddress(data.data.address._id);
      setShowNewAddress(false);
      setNewAddress({
        label: "Home",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
        phone: "",
        isDefault: false,
      });
      toast.success("Address added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add address");
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }
    setIsPreparingPayment(true);
    try {
      const { data } = await orderApi.create({
        shippingAddressId: selectedAddress,
        paymentMethod,
        notes,
      });
      setPlacedOrder(data.data.order);
      setShowPayment(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to initialize payment gateway",
      );
    } finally {
      setIsPreparingPayment(false);
    }
  };

  const handleEditAddress = (addr) => {
    setEditingAddress(addr._id);
    setEditForm({
      label: addr.label,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
      phone: addr.phone || "",
    });
  };
  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    try {
      await addressApi.update(editingAddress, editForm);
      const { data } = await addressApi.getAll();
      setAddresses(data.data.addresses);
      setEditingAddress(null);
      toast.success("Address updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
    }
  };
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await addressApi.delete(addressId);
      setAddresses((prev) => prev.filter((a) => a._id !== addressId));
      if (selectedAddress === addressId)
        setSelectedAddress(
          addresses.find((a) => a._id !== addressId)?._id || null,
        );
      toast.success("Address deleted");
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const shippingCostDisplay =
    shippingCost === 0 ? "FREE" : `$${shippingCost?.toFixed(2)}`;

  if (loading)
    return (
      <div className='flex flex-col justify-center items-center min-h-[60vh] gap-3 bg-white dark:bg-gray-950'>
        <Spinner size='md' className='text-slate-900 dark:text-white' />
        <p className='text-sm font-medium text-slate-500 dark:text-gray-400 animate-pulse'>
          Setting up secure session...
        </p>
      </div>
    );

  if (!items || items.length === 0)
    return (
      <div className='max-w-2xl mx-auto px-4 py-16 text-center bg-white dark:bg-gray-950 min-h-screen'>
        <h1 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2'>
          Your cart is empty
        </h1>
        <p className='text-sm text-slate-500 dark:text-gray-400 mb-8'>
          Add items to your cart before proceeding to checkout.
        </p>
        <Link to='/shop'>
          <Button
            variant='primary'
            className='px-6 py-3 rounded-lg font-bold bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-slate-800 dark:hover:bg-gray-200 transition-all'
          >
            Shop Now
          </Button>
        </Link>
      </div>
    );

  return (
    <div className='max-w-5xl mx-auto px-4 sm:px-6 py-8 bg-[#FAFAFA] dark:bg-gray-950 min-h-screen text-slate-900 dark:text-white font-sans'>
      <Link
        to='/cart'
        className='group inline-flex items-center text-xs font-semibold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6'
      >
        <HiChevronLeft className='w-3.5 h-3.5 mr-1 transition-transform group-hover:-translate-x-0.5' />{" "}
        Back to Cart
      </Link>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
        <div className='lg:col-span-8 space-y-4'>
          {/* Step 1: Shipping */}
          <div className='bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-[0_2px_12px_rgb(0,0,0,0.02)] dark:shadow-none border border-slate-100 dark:border-gray-700'>
            <div className='flex items-center gap-2 mb-4'>
              <div className='w-5 h-5 rounded-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-[10px] font-bold flex items-center justify-center'>
                1
              </div>
              <h2 className='text-base font-bold text-slate-900 dark:text-white tracking-tight'>
                Shipping Address
              </h2>
            </div>
            {addresses.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {addresses.map((addr) => (
                  <div key={addr._id} className='h-full'>
                    {editingAddress === addr._id ? (
                      <form
                        onSubmit={handleUpdateAddress}
                        className='p-4 border border-slate-200 dark:border-gray-600 rounded-xl bg-slate-50/50 dark:bg-gray-700/50 space-y-2.5 h-full'
                      >
                        <div className='grid grid-cols-2 gap-2.5'>
                          <div>
                            <label className='block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase mb-1'>
                              Label
                            </label>
                            <select
                              value={editForm.label}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  label: e.target.value,
                                })
                              }
                              className='w-full px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 dark:text-white border border-slate-200 dark:border-gray-600 rounded-lg'
                            >
                              <option>Home</option>
                              <option>Work</option>
                              <option>Other</option>
                            </select>
                          </div>
                          <div>
                            <label className='block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase mb-1'>
                              Phone
                            </label>
                            <input
                              type='text'
                              value={editForm.phone}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  phone: e.target.value,
                                })
                              }
                              className='w-full px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 dark:text-white border border-slate-200 dark:border-gray-600 rounded-lg'
                            />
                          </div>
                        </div>
                        <div>
                          <label className='block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase mb-1'>
                            Street *
                          </label>
                          <input
                            type='text'
                            value={editForm.street}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                street: e.target.value,
                              })
                            }
                            required
                            className='w-full px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 dark:text-white border border-slate-200 dark:border-gray-600 rounded-lg'
                          />
                        </div>
                        <div className='grid grid-cols-3 gap-2'>
                          <input
                            type='text'
                            placeholder='City'
                            value={editForm.city}
                            onChange={(e) =>
                              setEditForm({ ...editForm, city: e.target.value })
                            }
                            required
                            className='w-full px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 dark:text-white border border-slate-200 dark:border-gray-600 rounded-lg'
                          />
                          <input
                            type='text'
                            placeholder='State'
                            value={editForm.state}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                state: e.target.value,
                              })
                            }
                            required
                            className='w-full px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 dark:text-white border border-slate-200 dark:border-gray-600 rounded-lg'
                          />
                          <input
                            type='text'
                            placeholder='Zip'
                            value={editForm.zipCode}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                zipCode: e.target.value,
                              })
                            }
                            required
                            className='w-full px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 dark:text-white border border-slate-200 dark:border-gray-600 rounded-lg'
                          />
                        </div>
                        <div className='flex gap-1.5 pt-1'>
                          <button
                            type='submit'
                            className='px-3 py-1.5 bg-slate-950 dark:bg-white dark:text-slate-900 text-white font-bold rounded-lg text-[11px]'
                          >
                            Save
                          </button>
                          <button
                            type='button'
                            onClick={() => setEditingAddress(null)}
                            className='px-3 py-1.5 border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 font-semibold rounded-lg text-[11px] bg-white dark:bg-gray-800'
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <label
                        className={`flex flex-col justify-between h-full p-3.5 rounded-xl border relative cursor-pointer transition-all ${selectedAddress === addr._id ? "border-slate-900 dark:border-white bg-slate-50/50 dark:bg-gray-700/50" : "border-slate-100 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-slate-300 dark:hover:border-gray-500"}`}
                      >
                        <div>
                          <div className='flex items-center justify-between mb-1.5'>
                            <div className='flex items-center gap-1.5'>
                              <input
                                type='radio'
                                name='address'
                                checked={selectedAddress === addr._id}
                                onChange={() => setSelectedAddress(addr._id)}
                                className='w-3.5 h-3.5 text-slate-900 dark:text-white'
                              />
                              <span className='text-xs font-bold text-slate-900 dark:text-white uppercase'>
                                {addr.label}
                              </span>
                            </div>
                            {addr.isDefault && (
                              <span className='text-[9px] font-bold bg-slate-100 dark:bg-gray-600 text-slate-500 dark:text-gray-300 uppercase px-1.5 py-0.5 rounded-md'>
                                Default
                              </span>
                            )}
                          </div>
                          <p className='text-xs font-medium text-slate-500 dark:text-gray-400 pl-5'>
                            {addr.street}, {addr.city}, {addr.state}{" "}
                            {addr.zipCode}
                          </p>
                        </div>
                        <div className='flex gap-2.5 mt-3 pt-2.5 border-t border-slate-100/80 dark:border-gray-700 pl-5'>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleEditAddress(addr);
                            }}
                            className='text-[11px] font-bold text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white'
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteAddress(addr._id);
                            }}
                            className='text-[11px] font-bold text-slate-400 dark:text-gray-500 hover:text-rose-600 dark:hover:text-red-400'
                          >
                            Delete
                          </button>
                        </div>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-xs font-medium text-slate-500 dark:text-gray-400 mb-2'>
                No saved delivery addresses found.
              </p>
            )}

            {showNewAddress ? (
              <form
                onSubmit={handleAddAddress}
                className='mt-4 border-t border-slate-100 dark:border-gray-700 pt-4 space-y-3'
              >
                <h3 className='text-xs font-bold text-slate-900 dark:text-white uppercase'>
                  New Address Details
                </h3>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase mb-1'>
                      Label
                    </label>
                    <select
                      value={newAddress.label}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, label: e.target.value })
                      }
                      className='w-full px-3 py-2 text-xs font-medium bg-white dark:bg-gray-800 dark:text-white border border-slate-200 dark:border-gray-600 rounded-lg'
                    >
                      <option>Home</option>
                      <option>Work</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase mb-1'>
                      Phone
                    </label>
                    <input
                      type='text'
                      value={newAddress.phone}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, phone: e.target.value })
                      }
                      className='w-full px-3 py-2 text-xs font-medium bg-white dark:bg-gray-800 dark:text-white border border-slate-200 dark:border-gray-600 rounded-lg'
                      placeholder='Optional'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase mb-1'>
                    Street *
                  </label>
                  <input
                    type='text'
                    value={newAddress.street}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, street: e.target.value })
                    }
                    required
                    className='w-full px-3 py-2 text-xs font-medium bg-white dark:bg-gray-800 dark:text-white border border-slate-200 dark:border-gray-600 rounded-lg'
                  />
                </div>
                <div className='grid grid-cols-3 gap-3'>
                  <input
                    placeholder='City *'
                    type='text'
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                    required
                    className='w-full px-3 py-2 text-xs font-medium bg-white dark:bg-gray-800 dark:text-white border border-slate-200 dark:border-gray-600 rounded-lg'
                  />
                  <input
                    placeholder='State *'
                    type='text'
                    value={newAddress.state}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, state: e.target.value })
                    }
                    required
                    className='w-full px-3 py-2 text-xs font-medium bg-white dark:bg-gray-800 dark:text-white border border-slate-200 dark:border-gray-600 rounded-lg'
                  />
                  <input
                    placeholder='Zip Code *'
                    type='text'
                    value={newAddress.zipCode}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, zipCode: e.target.value })
                    }
                    required
                    className='w-full px-3 py-2 text-xs font-medium bg-white dark:bg-gray-800 dark:text-white border border-slate-200 dark:border-gray-600 rounded-lg'
                  />
                </div>
                <div className='flex gap-2 pt-1'>
                  <Button
                    type='submit'
                    variant='primary'
                    className='px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 dark:bg-white dark:text-slate-900 text-white'
                  >
                    Save Address
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setShowNewAddress(false)}
                    className='px-4 py-2 text-xs font-semibold rounded-lg border-slate-200 dark:border-gray-600 dark:text-gray-300'
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowNewAddress(true)}
                className='mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors'
              >
                <HiPlus className='w-3.5 h-3.5' /> Add New Address
              </button>
            )}
          </div>

          {/* Step 2: Payment */}
          <div className='bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-[0_2px_12px_rgb(0,0,0,0.02)] dark:shadow-none border border-slate-100 dark:border-gray-700'>
            <div className='flex items-center gap-2 mb-4'>
              <div className='w-5 h-5 rounded-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-[10px] font-bold flex items-center justify-center'>
                2
              </div>
              <h2 className='text-base font-bold text-slate-900 dark:text-white tracking-tight'>
                Payment Method
              </h2>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              {[
                { value: "card", label: "Credit / Debit", icon: HiCreditCard },
                { value: "cash", label: "Cash on Delivery", icon: "💵" },
                { value: "wallet", label: "Digital Wallet", icon: "📱" },
              ].map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === method.value ? "border-slate-900 dark:border-white bg-slate-50/50 dark:bg-gray-700/50" : "border-slate-100 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-slate-300 dark:hover:border-gray-500"}`}
                >
                  <input
                    type='radio'
                    name='payment'
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value)}
                    className='w-3.5 h-3.5 text-slate-900 dark:text-white'
                  />
                  <span className='text-base shrink-0 text-slate-700 dark:text-gray-300'>
                    {typeof method.icon === "string" ? (
                      method.icon
                    ) : (
                      <method.icon className='w-4 h-4' />
                    )}
                  </span>
                  <span className='text-xs font-bold text-slate-900 dark:text-white'>
                    {method.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Step 3: Notes */}
          <div className='bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-[0_2px_12px_rgb(0,0,0,0.02)] dark:shadow-none border border-slate-100 dark:border-gray-700'>
            <div className='flex items-center gap-2 mb-3'>
              <div className='w-5 h-5 rounded-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-[10px] font-bold flex items-center justify-center'>
                3
              </div>
              <h2 className='text-base font-bold text-slate-900 dark:text-white tracking-tight'>
                Order Notes{" "}
                <span className='text-xs font-medium text-slate-400 dark:text-gray-500 lowercase'>
                  (optional)
                </span>
              </h2>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Add delivery instructions...'
              className='w-full px-3 py-2.5 text-xs font-medium text-slate-900 dark:text-white bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white placeholder:text-slate-400 dark:placeholder:text-gray-500 resize-none'
              rows={2}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className='lg:col-span-4'>
          <div className='bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100 dark:border-gray-700 sticky top-6'>
            <h2 className='text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase'>
              Order Summary
            </h2>
            <div className='max-h-36 overflow-y-auto space-y-2.5 mb-4 pr-1 border-b border-slate-100 dark:border-gray-700 pb-4'>
              {items.map((item) => (
                <div
                  key={item._id}
                  className='flex gap-2.5 items-center justify-between'
                >
                  <div className='flex gap-2.5 items-center min-w-0'>
                    <img
                      src={
                        item.product?.images?.[0]?.url ||
                        "https://via.placeholder.com/50x50?text=No+Image"
                      }
                      alt={item.product?.name}
                      className='w-9 h-9 object-cover rounded-lg bg-slate-50 dark:bg-gray-700 border border-slate-100 dark:border-gray-600 shrink-0'
                    />
                    <div className='min-w-0'>
                      <p className='text-xs font-bold text-slate-900 dark:text-white truncate'>
                        {item.product?.name}
                      </p>
                      <p className='text-[10px] font-medium text-slate-400 dark:text-gray-500 mt-0.5'>
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className='text-xs font-bold text-slate-900 dark:text-white shrink-0'>
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className='space-y-2.5 text-xs font-medium border-b border-slate-100 dark:border-gray-700 pb-4 mb-4'>
              <div className='flex justify-between text-slate-500 dark:text-gray-400'>
                <span>Subtotal ({totalItems} items)</span>
                <span className='text-slate-900 dark:text-white'>
                  ${subtotal?.toFixed(2)}
                </span>
              </div>
              <div className='flex justify-between text-slate-500 dark:text-gray-400'>
                <span>Shipping</span>
                <span
                  className={
                    shippingCost === 0
                      ? "text-emerald-600 dark:text-emerald-400 font-bold"
                      : "text-slate-900 dark:text-white"
                  }
                >
                  {shippingCostDisplay}
                </span>
              </div>
              {discount > 0 && (
                <div className='flex justify-between text-emerald-600 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-900/20 px-2.5 py-1.5 rounded-lg font-semibold'>
                  <span>Discount</span>
                  <span className='font-bold'>-${discount?.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className='flex justify-between items-end mb-5'>
              <span className='text-xs font-bold text-slate-900 dark:text-white uppercase'>
                Total
              </span>
              <span className='text-xl font-extrabold text-slate-900 dark:text-white'>
                ${total?.toFixed(2)}
              </span>
            </div>
            <Button
              onClick={handleProceedToPayment}
              disabled={isPreparingPayment || !selectedAddress}
              variant='primary'
              className='w-full py-3 rounded-xl text-sm font-bold bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-slate-800 dark:hover:bg-gray-200 transition-all'
            >
              {isPreparingPayment ? (
                "Connecting..."
              ) : (
                <>
                  <HiShieldCheck className='w-4 h-4' /> Proceed to Payment
                </>
              )}
            </Button>
            <p className='text-[10px] text-slate-400 dark:text-gray-500 text-center mt-3'>
              Secured with end-to-end encryption.
            </p>
          </div>
        </div>
      </div>

      {placedOrder && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          orderId={placedOrder._id}
          orderTotal={placedOrder.total}
          orderNumber={placedOrder.orderNumber}
          onSuccess={() => {
            setShowPayment(false);
            navigate(`/orders/${placedOrder._id}`);
          }}
        />
      )}
    </div>
  );
}
