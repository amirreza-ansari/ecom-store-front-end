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
        { headers: { Authorization: `Bearer ${token}` } },
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

  if (loading)
    return (
      <div className='flex justify-center items-center min-h-[70vh] bg-[#FAFAFA] dark:bg-gray-950'>
        <div className='flex flex-col items-center gap-4 animate-pulse'>
          <Spinner size='lg' className='text-slate-900 dark:text-white' />
          <p className='text-sm font-medium text-slate-500 dark:text-gray-400'>
            Retrieving secure order details...
          </p>
        </div>
      </div>
    );

  if (!order) return null;

  return (
    <div className='max-w-6xl mx-auto px-4 sm:px-6 py-10 bg-[#FAFAFA] dark:bg-gray-950 min-h-screen text-slate-900 dark:text-white font-sans'>
      <Link
        to='/orders'
        className='group inline-flex items-center text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-8'
      >
        <HiArrowLeft className='w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1' />{" "}
        Back to Order History
      </Link>

      <div className='bg-white dark:bg-gray-800 rounded-3xl p-8 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden'>
        <div className='absolute -right-20 -top-20 w-64 h-64 bg-slate-50 dark:bg-gray-700 rounded-full blur-3xl opacity-60 pointer-events-none' />
        <div className='relative z-10'>
          <p className='text-xs font-semibold tracking-wider text-slate-400 dark:text-gray-500 uppercase mb-1.5'>
            Order Identifier
          </p>
          <h1 className='text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2'>
            #{order.orderNumber}
          </h1>
          <p className='text-sm font-medium text-slate-500 dark:text-gray-400'>
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
            className='text-sm px-4 py-1.5 font-semibold rounded-full capitalize'
          >
            {order.status}
          </Badge>
          <Badge
            variant={paymentBadges[order.paymentStatus] || "neutral"}
            className='text-sm px-4 py-1.5 font-semibold rounded-full capitalize'
          >
            Payment: {order.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-8 space-y-8'>
          {order.statusHistory?.length > 0 && (
            <div className='bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-gray-700'>
              <h2 className='text-sm font-bold tracking-widest text-slate-400 dark:text-gray-500 uppercase mb-8'>
                Journey Tracker
              </h2>
              <div className='relative ml-3'>
                <div className='absolute left-1.5 top-2.5 bottom-6 w-0.5 bg-slate-100 dark:bg-gray-700' />
                <div className='space-y-8 relative'>
                  {order.statusHistory.map((entry, index) => {
                    const isLatest = index === 0;
                    return (
                      <div key={index} className='flex gap-5 relative z-10'>
                        <div className='flex flex-col items-center mt-1'>
                          <div
                            className={`w-3.5 h-3.5 rounded-full ring-4 ring-white dark:ring-gray-800 ${isLatest ? "bg-slate-900 dark:bg-white shadow-md" : "bg-slate-300 dark:bg-gray-600"}`}
                          />
                        </div>
                        <div className='flex-1'>
                          <p
                            className={`text-base font-semibold capitalize ${isLatest ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-gray-400"}`}
                          >
                            {entry.status}
                          </p>
                          <p className='text-sm font-medium text-slate-400 dark:text-gray-500 mt-1'>
                            {new Date(entry.date).toLocaleString([], {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                          {entry.note && (
                            <p className='text-sm text-slate-500 dark:text-gray-400 mt-2 bg-slate-50 dark:bg-gray-700 p-3 rounded-xl border border-slate-100 dark:border-gray-600 inline-block'>
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

          <div className='bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-gray-700'>
            <h2 className='text-sm font-bold tracking-widest text-slate-400 dark:text-gray-500 uppercase mb-6'>
              Purchased Items
            </h2>
            <div className='space-y-6'>
              {order.items?.map((item) => (
                <div
                  key={item._id}
                  className='flex flex-col sm:flex-row gap-5 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-gray-600'
                >
                  <div className='w-24 h-24 shrink-0 rounded-2xl bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 overflow-hidden shadow-sm'>
                    <img
                      src={
                        item.image ||
                        "https://via.placeholder.com/150?text=No+Image"
                      }
                      alt={item.name}
                      className='w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal'
                    />
                  </div>
                  <div className='flex-1 flex flex-col justify-center'>
                    <Link
                      to={`/product/${item.product?.slug || "#"}`}
                      className='text-base font-bold text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-gray-300 transition-colors line-clamp-2 mb-1'
                    >
                      {item.name}
                    </Link>
                    <p className='text-sm font-medium text-slate-500 dark:text-gray-400'>
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className='flex flex-col justify-center sm:items-end mt-2 sm:mt-0'>
                    <p className='text-lg font-bold text-slate-900 dark:text-white'>
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className='text-xs font-medium text-slate-400 dark:text-gray-500 mt-1'>
                      ${item.price?.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-8'>
          <div className='bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-gray-700 flex flex-col h-full max-h-[600px]'>
            <h2 className='text-sm font-bold tracking-widest text-slate-400 dark:text-gray-500 uppercase mb-6'>
              Payment Summary
            </h2>
            <div className='space-y-4 text-sm font-medium flex-1'>
              <div className='flex justify-between'>
                <span className='text-slate-500 dark:text-gray-400'>
                  Subtotal
                </span>
                <span className='text-slate-900 dark:text-white'>
                  ${order.subtotal?.toFixed(2)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-500 dark:text-gray-400'>
                  Shipping
                </span>
                <span className='text-slate-900 dark:text-white'>
                  {order.shippingCost === 0 ? (
                    <span className='text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md'>
                      FREE
                    </span>
                  ) : (
                    `$${order.shippingCost?.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-500 dark:text-gray-400'>Tax</span>
                <span className='text-slate-900 dark:text-white'>
                  ${order.tax?.toFixed(2)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className='flex justify-between text-emerald-600 dark:text-emerald-400'>
                  <span>Discount</span>
                  <span className='font-bold'>
                    -${order.discount?.toFixed(2)}
                  </span>
                </div>
              )}
              <div className='pt-6 mt-6 border-t border-slate-100 dark:border-gray-700 flex justify-between items-end'>
                <span className='text-base font-bold text-slate-900 dark:text-white'>
                  Total
                </span>
                <span className='text-3xl font-extrabold text-slate-900 dark:text-white'>
                  ${order.total?.toFixed(2)}
                </span>
              </div>
            </div>
            <div className='mt-8 space-y-3'>
              <button
                onClick={handleDownloadInvoice}
                className='flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-white dark:bg-gray-800 border-2 border-slate-200 dark:border-gray-600 rounded-xl text-sm font-bold text-slate-700 dark:text-gray-300 hover:border-slate-900 dark:hover:border-white hover:text-slate-900 dark:hover:text-white shadow-sm transition-all'
              >
                <HiOutlineDocumentText className='w-5 h-5' /> Download Invoice
              </button>
              {["pending", "confirmed"].includes(order.status) && (
                <Button
                  onClick={handleCancel}
                  variant='danger'
                  className='flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border-none transition-colors'
                  disabled={cancelling}
                >
                  <HiXMark className='w-5 h-5' />
                  {cancelling ? "Processing..." : "Cancel Order"}
                </Button>
              )}
            </div>
          </div>

          <div className='bg-slate-900 dark:bg-gray-800 rounded-3xl p-8 shadow-xl text-white'>
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
                <div className='mt-4 pt-4 border-t border-slate-800 dark:border-gray-700 flex items-center gap-2'>
                  <span className='text-slate-500'>Tel:</span>
                  <span className='text-white'>
                    {order.shippingAddress.phone}
                  </span>
                </div>
              )}
            </address>
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
