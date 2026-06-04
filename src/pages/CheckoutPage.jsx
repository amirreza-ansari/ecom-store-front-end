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
  HiCheck,
  HiChevronLeft,
  HiShieldCheck,
  HiCreditCard,
} from "react-icons/hi2";
import toast from "react-hot-toast";

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
  const [placing, setPlacing] = useState(false);
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

      // Select default address
      const defaultAddr = addrRes.data.data.addresses?.find((a) => a.isDefault);
      if (defaultAddr) setSelectedAddress(defaultAddr._id);
      else if (addrRes.data.data.addresses?.length > 0) {
        setSelectedAddress(addrRes.data.data.addresses[0]._id);
      }
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

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    setPlacing(true);
    try {
      const { data } = await orderApi.create({
        shippingAddressId: selectedAddress,
        paymentMethod,
        notes,
      });
      toast.success("Order placed successfully!");
      navigate(`/orders/${data.data.order._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
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
    if (!confirm("Delete this address?")) return;
    try {
      await addressApi.delete(addressId);
      setAddresses((prev) => prev.filter((a) => a._id !== addressId));
      if (selectedAddress === addressId) {
        setSelectedAddress(
          addresses.find((a) => a._id !== addressId)?._id || null,
        );
      }
      toast.success("Address deleted");
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const shippingCostDisplay =
    shippingCost === 0 ? "FREE" : `$${shippingCost?.toFixed(2)}`;

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Spinner size='lg' />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className='max-w-7xl mx-auto px-4 py-16 text-center'>
        <h1 className='text-2xl font-bold text-[#0F1111] mb-2'>
          Your cart is empty
        </h1>
        <p className='text-[#565959] mb-8'>
          Add items to your cart before checkout.
        </p>
        <Link to='/shop'>
          <Button variant='primary' size='lg'>
            Shop Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-6'>
      {/* Back link */}
      <Link
        to='/cart'
        className='inline-flex items-center text-sm text-[#565959] hover:text-[#FF9900] mb-6'
      >
        <HiChevronLeft className='w-4 h-4 mr-1' />
        Back to Cart
      </Link>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Main Content */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Shipping Address */}
          <div className='bg-white rounded-lg p-6 shadow-sm'>
            <h2 className='text-lg font-bold text-[#0F1111] mb-4'>
              1. Shipping Address
            </h2>

            {addresses.length > 0 ? (
              <div className='space-y-3'>
                {addresses.map((addr) => (
                  <div key={addr._id}>
                    {editingAddress === addr._id ? (
                      /* Edit Form */
                      <form
                        onSubmit={handleUpdateAddress}
                        className='p-4 border-2 border-[#FF9900] rounded-lg bg-[#FFF8F0] space-y-3'
                      >
                        <div className='grid grid-cols-2 gap-3'>
                          <div>
                            <label className='block text-xs text-[#565959] mb-1'>
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
                              className='w-full px-3 py-2 text-sm border border-[#D5D9D9] rounded-lg'
                            >
                              <option>Home</option>
                              <option>Work</option>
                              <option>Other</option>
                            </select>
                          </div>
                          <div>
                            <label className='block text-xs text-[#565959] mb-1'>
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
                              className='w-full px-3 py-2 text-sm border border-[#D5D9D9] rounded-lg'
                            />
                          </div>
                        </div>
                        <div>
                          <label className='block text-xs text-[#565959] mb-1'>
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
                            className='w-full px-3 py-2 text-sm border border-[#D5D9D9] rounded-lg'
                          />
                        </div>
                        <div className='grid grid-cols-3 gap-3'>
                          <div>
                            <label className='block text-xs text-[#565959] mb-1'>
                              City *
                            </label>
                            <input
                              type='text'
                              value={editForm.city}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  city: e.target.value,
                                })
                              }
                              required
                              className='w-full px-3 py-2 text-sm border border-[#D5D9D9] rounded-lg'
                            />
                          </div>
                          <div>
                            <label className='block text-xs text-[#565959] mb-1'>
                              State *
                            </label>
                            <input
                              type='text'
                              value={editForm.state}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  state: e.target.value,
                                })
                              }
                              required
                              className='w-full px-3 py-2 text-sm border border-[#D5D9D9] rounded-lg'
                            />
                          </div>
                          <div>
                            <label className='block text-xs text-[#565959] mb-1'>
                              Zip Code *
                            </label>
                            <input
                              type='text'
                              value={editForm.zipCode}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  zipCode: e.target.value,
                                })
                              }
                              required
                              className='w-full px-3 py-2 text-sm border border-[#D5D9D9] rounded-lg'
                            />
                          </div>
                        </div>
                        <div className='flex gap-2'>
                          <Button type='submit' variant='primary' size='sm'>
                            Save
                          </Button>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => setEditingAddress(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      /* Address Display */
                      <label
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedAddress === addr._id
                            ? "border-[#FF9900] bg-[#FFF8F0]"
                            : "border-[#D5D9D9] hover:border-[#FF9900]"
                        }`}
                      >
                        <input
                          type='radio'
                          name='address'
                          checked={selectedAddress === addr._id}
                          onChange={() => setSelectedAddress(addr._id)}
                          className='mt-1 w-4 h-4 text-[#FF9900] focus:ring-[#FF9900]'
                        />
                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <span className='font-medium text-[#0F1111]'>
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className='text-xs bg-[#F7FAFA] px-2 py-0.5 rounded-full text-[#565959]'>
                                Default
                              </span>
                            )}
                          </div>
                          <p className='text-sm text-[#565959] mt-1'>
                            {addr.street}, {addr.city}, {addr.state}{" "}
                            {addr.zipCode}, {addr.country}
                          </p>
                          {addr.phone && (
                            <p className='text-sm text-[#565959]'>
                              📱 {addr.phone}
                            </p>
                          )}

                          {/* Edit / Delete buttons */}
                          <div className='flex gap-3 mt-2'>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleEditAddress(addr);
                              }}
                              className='text-xs text-[#FF9900] hover:underline'
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteAddress(addr._id);
                              }}
                              className='text-xs text-[#B12704] hover:underline'
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {selectedAddress === addr._id && (
                          <HiCheck className='w-5 h-5 text-[#FF9900] shrink-0' />
                        )}
                      </label>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-sm text-[#565959] mb-4'>
                No addresses found. Please add one.
              </p>
            )}

            {/* Add new address */}
            {showNewAddress ? (
              <form
                onSubmit={handleAddAddress}
                className='mt-4 border-t border-[#D5D9D9] pt-4 space-y-3'
              >
                <h3 className='text-sm font-bold text-[#0F1111]'>
                  New Address
                </h3>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs text-[#565959] mb-1'>
                      Label
                    </label>
                    <select
                      value={newAddress.label}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, label: e.target.value })
                      }
                      className='w-full px-3 py-2 text-sm border border-[#D5D9D9] rounded-lg'
                    >
                      <option>Home</option>
                      <option>Work</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-xs text-[#565959] mb-1'>
                      Phone
                    </label>
                    <input
                      type='text'
                      value={newAddress.phone}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, phone: e.target.value })
                      }
                      className='w-full px-3 py-2 text-sm border border-[#D5D9D9] rounded-lg'
                      placeholder='Optional'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-xs text-[#565959] mb-1'>
                    Street *
                  </label>
                  <input
                    type='text'
                    value={newAddress.street}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, street: e.target.value })
                    }
                    required
                    className='w-full px-3 py-2 text-sm border border-[#D5D9D9] rounded-lg'
                  />
                </div>
                <div className='grid grid-cols-3 gap-3'>
                  <div>
                    <label className='block text-xs text-[#565959] mb-1'>
                      City *
                    </label>
                    <input
                      type='text'
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      required
                      className='w-full px-3 py-2 text-sm border border-[#D5D9D9] rounded-lg'
                    />
                  </div>
                  <div>
                    <label className='block text-xs text-[#565959] mb-1'>
                      State *
                    </label>
                    <input
                      type='text'
                      value={newAddress.state}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, state: e.target.value })
                      }
                      required
                      className='w-full px-3 py-2 text-sm border border-[#D5D9D9] rounded-lg'
                    />
                  </div>
                  <div>
                    <label className='block text-xs text-[#565959] mb-1'>
                      Zip Code *
                    </label>
                    <input
                      type='text'
                      value={newAddress.zipCode}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          zipCode: e.target.value,
                        })
                      }
                      required
                      className='w-full px-3 py-2 text-sm border border-[#D5D9D9] rounded-lg'
                    />
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button type='submit' variant='primary' size='sm'>
                    Save Address
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setShowNewAddress(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowNewAddress(true)}
                className='mt-4 flex items-center gap-2 text-sm text-[#FF9900] hover:underline font-medium'
              >
                <HiPlus className='w-4 h-4' /> Add New Address
              </button>
            )}
          </div>

          {/* Payment Method */}
          <div className='bg-white rounded-lg p-6 shadow-sm'>
            <h2 className='text-lg font-bold text-[#0F1111] mb-4'>
              2. Payment Method
            </h2>
            <div className='space-y-3'>
              {[
                {
                  value: "card",
                  label: "Credit/Debit Card",
                  icon: HiCreditCard,
                },
                { value: "cash", label: "Cash on Delivery", icon: "💵" },
                { value: "wallet", label: "Digital Wallet", icon: "📱" },
              ].map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    paymentMethod === method.value
                      ? "border-[#FF9900] bg-[#FFF8F0]"
                      : "border-[#D5D9D9] hover:border-[#FF9900]"
                  }`}
                >
                  <input
                    type='radio'
                    name='payment'
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value)}
                    className='w-4 h-4 text-[#FF9900] focus:ring-[#FF9900]'
                  />
                  <span className='text-lg'>
                    {typeof method.icon === "string" ? (
                      method.icon
                    ) : (
                      <method.icon className='w-5 h-5' />
                    )}
                  </span>
                  <span className='font-medium text-[#0F1111]'>
                    {method.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Order Notes */}
          <div className='bg-white rounded-lg p-6 shadow-sm'>
            <h2 className='text-lg font-bold text-[#0F1111] mb-4'>
              3. Order Notes (Optional)
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Special instructions for your order...'
              className='w-full px-4 py-3 text-sm border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900] resize-none'
              rows={3}
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className='lg:col-span-1'>
          <div className='bg-white rounded-lg p-6 shadow-sm sticky top-24'>
            <h2 className='text-lg font-bold text-[#0F1111] mb-4'>
              Order Summary
            </h2>

            {/* Items */}
            <div className='space-y-3 mb-4'>
              {items.map((item) => (
                <div key={item._id} className='flex gap-3'>
                  <img
                    src={
                      item.product?.images?.[0]?.url ||
                      "https://via.placeholder.com/50x50?text=No+Image"
                    }
                    alt={item.product?.name}
                    className='w-12 h-12 object-cover rounded'
                  />
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm text-[#0F1111] truncate'>
                      {item.product?.name}
                    </p>
                    <p className='text-xs text-[#565959]'>
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className='text-sm font-medium'>
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className='border-t border-[#D5D9D9] pt-4 space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-[#565959]'>
                  Subtotal ({totalItems} items)
                </span>
                <span>${subtotal?.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-[#565959]'>Shipping</span>
                <span className={shippingCost === 0 ? "text-[#067D62]" : ""}>
                  {shippingCostDisplay}
                </span>
              </div>
              {discount > 0 && (
                <div className='flex justify-between'>
                  <span className='text-[#067D62]'>Discount</span>
                  <span className='text-[#067D62]'>
                    -${discount?.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className='border-t border-[#D5D9D9] mt-4 pt-4'>
              <div className='flex justify-between text-lg font-bold text-[#0F1111]'>
                <span>Total</span>
                <span>${total?.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={placing || !selectedAddress}
              variant='primary'
              size='lg'
              className='w-full mt-6'
            >
              {placing ? (
                "Placing Order..."
              ) : (
                <>
                  <HiShieldCheck className='w-5 h-5 mr-2' />
                  Place Order
                </>
              )}
            </Button>

            <p className='text-xs text-[#565959] text-center mt-3'>
              By placing your order, you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
