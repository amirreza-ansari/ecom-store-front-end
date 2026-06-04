import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { orderApi } from "../features/orders/orderApi";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import {
  HiArrowLeft,
  HiArrowDownTray,
  HiXMark,
  HiOutlineMapPin,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import toast from "react-hot-toast";

const statusBadges = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
  returned: "neutral",
};

const paymentBadges = {
  pending: "warning",
  paid: "success",
  failed: "danger",
  refunded: "neutral",
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await orderApi.getById(id);
      setOrder(data.data.order);
    } catch (error) {
      toast.error("Failed to load order specifics");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    // Note: Consider replacing this native confirm with a polished Headless UI Modal in the future
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setCancelling(true);
    try {
      await orderApi.cancel(id, { reason: "Cancelled by customer" });
      toast.success("Order successfully cancelled");
      fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/orders/${order._id}/invoice`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice_${order.orderNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice download started");
    } catch (error) {
      toast.error("Unable to generate invoice at this time");
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[70vh]'>
        <div className='flex flex-col items-center gap-4 animate-pulse'>
          <Spinner size='lg' className='text-slate-900' />
          <p className='text-sm font-medium text-slate-500'>
            Retrieving secure order details...
          </p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className='max-w-6xl mx-auto px-4 sm:px-6 py-10 bg-[#FAFAFA] min-h-screen text-slate-900 font-sans'>
      {/* Navigation Header */}
      <Link
        to='/orders'
        className='group inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8'
      >
        <HiArrowLeft className='w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1' />
        Back to Order History
      </Link>

      {/* Primary Bento Header */}
      <div className='bg-white rounded-3xl p-8 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden'>
        {/* Subtle Glassmorphic accent blob */}
        <div className='absolute -right-20 -top-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-60 pointer-events-none' />

        <div className='relative z-10'>
          <p className='text-xs font-semibold tracking-wider text-slate-400 uppercase mb-1.5'>
            Order Identifier
          </p>
          <h1 className='text-3xl font-extrabold tracking-tight text-slate-900 mb-2'>
            #{order.orderNumber}
          </h1>
          <p className='text-sm font-medium text-slate-500'>
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-3 relative z-10'>
          <Badge
            variant={statusBadges[order.status] || "neutral"}
            className='text-sm px-4 py-1.5 font-semibold rounded-full capitalize shadow-sm backdrop-blur-md'
          >
            {order.status}
          </Badge>
          <Badge
            variant={paymentBadges[order.paymentStatus] || "neutral"}
            className='text-sm px-4 py-1.5 font-semibold rounded-full capitalize shadow-sm backdrop-blur-md'
          >
            Payment: {order.paymentStatus}
          </Badge>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        {/* Left Column: Timeline & Items (Span 8) */}
        <div className='lg:col-span-8 space-y-8'>
          {/* Timeline Box */}
          {order.statusHistory?.length > 0 && (
            <div className='bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100'>
              <h2 className='text-sm font-bold tracking-widest text-slate-400 uppercase mb-8'>
                Journey Tracker
              </h2>
              <div className='relative ml-3'>
                {/* Continuous background line */}
                <div className='absolute left-1.5 top-2.5 bottom-6 w-0.5 bg-slate-100' />

                <div className='space-y-8 relative'>
                  {order.statusHistory.map((entry, index) => {
                    const isLatest = index === 0;
                    return (
                      <div key={index} className='flex gap-5 relative z-10'>
                        <div className='flex flex-col items-center mt-1'>
                          {/* Indicator Node */}
                          <div
                            className={`w-3.5 h-3.5 rounded-full ring-4 ring-white ${
                              isLatest
                                ? "bg-slate-900 shadow-md"
                                : "bg-slate-300"
                            }`}
                          />
                        </div>
                        <div className='flex-1'>
                          <p
                            className={`text-base font-semibold capitalize ${isLatest ? "text-slate-900" : "text-slate-600"}`}
                          >
                            {entry.status}
                          </p>
                          <p className='text-sm font-medium text-slate-400 mt-1'>
                            {new Date(entry.date).toLocaleString([], {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                          {entry.note && (
                            <p className='text-sm text-slate-500 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 inline-block'>
                              {entry.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Items Box */}
          <div className='bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100'>
            <h2 className='text-sm font-bold tracking-widest text-slate-400 uppercase mb-6'>
              Purchased Items
            </h2>
            <div className='space-y-6'>
              {order.items?.map((item) => (
                <div
                  key={item._id}
                  className='flex flex-col sm:flex-row gap-5 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100'
                >
                  <div className='w-24 h-24 shrink-0 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm'>
                    <img
                      src={
                        item.image ||
                        "https://via.placeholder.com/150?text=No+Image"
                      }
                      alt={item.name}
                      className='w-full h-full object-cover mix-blend-multiply'
                    />
                  </div>
                  <div className='flex-1 flex flex-col justify-center'>
                    <Link
                      to={`/product/${item.product?.slug || "#"}`}
                      className='text-base font-bold text-slate-900 hover:text-slate-600 transition-colors line-clamp-2 mb-1'
                    >
                      {item.name}
                    </Link>
                    <p className='text-sm font-medium text-slate-500'>
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className='flex flex-col justify-center sm:items-end mt-2 sm:mt-0'>
                    <p className='text-lg font-bold text-slate-900'>
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className='text-xs font-medium text-slate-400 mt-1'>
                      ${item.price?.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Shipping (Span 4) */}
        <div className='lg:col-span-4 space-y-8'>
          {/* Financial Summary */}
          <div className='bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-full max-h-[600px]'>
            <h2 className='text-sm font-bold tracking-widest text-slate-400 uppercase mb-6'>
              Payment Summary
            </h2>

            <div className='space-y-4 text-sm font-medium flex-1'>
              <div className='flex justify-between items-center'>
                <span className='text-slate-500'>Subtotal</span>
                <span className='text-slate-900'>
                  ${order.subtotal?.toFixed(2)}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-slate-500'>Shipping</span>
                <span className='text-slate-900'>
                  {order.shippingCost === 0 ? (
                    <span className='text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md'>
                      FREE
                    </span>
                  ) : (
                    `$${order.shippingCost?.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-slate-500'>Estimated Tax</span>
                <span className='text-slate-900'>${order.tax?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className='flex justify-between items-center text-emerald-600'>
                  <span>Discount Applied</span>
                  <span className='font-bold'>
                    -${order.discount?.toFixed(2)}
                  </span>
                </div>
              )}

              <div className='pt-6 mt-6 border-t border-slate-100 flex justify-between items-end'>
                <span className='text-base font-bold text-slate-900'>
                  Total
                </span>
                <span className='text-3xl font-extrabold text-slate-900 tracking-tight'>
                  ${order.total?.toFixed(2)}
                </span>
              </div>
            </div>

            <div className='mt-8 space-y-3'>
              <button
                onClick={handleDownloadInvoice}
                className='flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-slate-900 hover:text-slate-900 shadow-sm transition-all'
              >
                <HiOutlineDocumentText className='w-5 h-5' />
                Download Invoice
              </button>

              {["pending", "confirmed"].includes(order.status) && (
                <Button
                  onClick={handleCancel}
                  variant='danger'
                  className='flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold bg-red-50 text-red-600 hover:bg-red-100 border-none transition-colors'
                  disabled={cancelling}
                >
                  <HiXMark className='w-5 h-5' />
                  {cancelling ? "Processing..." : "Cancel Order"}
                </Button>
              )}
            </div>
          </div>

          {/* Delivery Box */}
          <div className='bg-slate-900 rounded-3xl p-8 shadow-xl text-white'>
            <div className='flex items-center gap-2 mb-6'>
              <HiOutlineMapPin className='w-5 h-5 text-slate-400' />
              <h2 className='text-sm font-bold tracking-widest text-slate-400 uppercase'>
                Delivery Details
              </h2>
            </div>

            <address className='not-italic text-sm font-medium text-slate-300 leading-relaxed'>
              <span className='block text-white text-base font-bold mb-2'>
                {order.shippingAddress?.recipientName || "Customer Name"}
              </span>
              {order.shippingAddress?.street}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
              {order.shippingAddress?.zipCode}
              <br />
              {order.shippingAddress?.country}
              {order.shippingAddress?.phone && (
                <div className='mt-4 pt-4 border-t border-slate-800 flex items-center gap-2'>
                  <span className='text-slate-500'>Tel:</span>
                  <span className='text-white'>
                    {order.shippingAddress.phone}
                  </span>
                </div>
              )}
            </address>

            {/* Tracking Snippet embedded in shipping */}
            {order.trackingNumber && (
              <div className='mt-6 bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10'>
                <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1'>
                  Tracking ID
                </p>
                <p className='text-base font-mono font-bold text-white tracking-widest'>
                  {order.trackingNumber}
                </p>
                {order.estimatedDelivery && (
                  <p className='text-xs font-medium text-emerald-400 mt-2 flex items-center gap-1.5'>
                    <div className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse' />
                    Est.{" "}
                    {new Date(order.estimatedDelivery).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric" },
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
