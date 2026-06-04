import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { orderApi } from "../features/orders/orderApi";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { HiArrowLeft, HiArrowDownTray, HiXMark } from "react-icons/hi2";
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
      toast.error("Failed to load order");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      await orderApi.cancel(id, { reason: "Cancelled by customer" });
      toast.success("Order cancelled");
      fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel");
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

      if (!response.ok) throw new Error("Failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order.orderNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded!");
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Spinner size='lg' />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className='max-w-4xl mx-auto px-4 py-6'>
      {/* Back */}
      <Link
        to='/orders'
        className='inline-flex items-center text-sm text-[#565959] hover:text-[#FF9900] mb-6'
      >
        <HiArrowLeft className='w-4 h-4 mr-1' /> Back to Orders
      </Link>

      {/* Header */}
      <div className='bg-white rounded-lg p-6 shadow-sm mb-6'>
        <div className='flex items-center justify-between flex-wrap gap-4'>
          <div>
            <p className='text-xs text-[#565959]'>Order Number</p>
            <h1 className='text-xl font-bold text-[#0F1111]'>
              #{order.orderNumber}
            </h1>
            <p className='text-sm text-[#565959] mt-1'>
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Badge
              variant={statusBadges[order.status] || "neutral"}
              className='text-sm px-3 py-1'
            >
              {order.status}
            </Badge>
            <Badge
              variant={paymentBadges[order.paymentStatus] || "neutral"}
              className='text-sm px-3 py-1'
            >
              Payment: {order.paymentStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      {order.statusHistory?.length > 0 && (
        <div className='bg-white rounded-lg p-6 shadow-sm mb-6'>
          <h2 className='text-sm font-bold text-[#0F1111] uppercase mb-4'>
            Order Progress
          </h2>
          <div className='space-y-4'>
            {order.statusHistory.map((entry, index) => (
              <div key={index} className='flex gap-3'>
                <div className='flex flex-col items-center'>
                  <div
                    className={`w-3 h-3 rounded-full ${index === 0 ? "bg-[#FF9900]" : "bg-[#D5D9D9]"}`}
                  />
                  {index < order.statusHistory.length - 1 && (
                    <div className='w-0.5 h-full bg-[#D5D9D9]' />
                  )}
                </div>
                <div className='pb-4'>
                  <p className='text-sm font-medium text-[#0F1111] capitalize'>
                    {entry.status}
                  </p>
                  <p className='text-xs text-[#565959]'>
                    {new Date(entry.date).toLocaleString()}{" "}
                    {entry.note ? `- ${entry.note}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Items */}
        <div className='md:col-span-2'>
          <div className='bg-white rounded-lg p-6 shadow-sm'>
            <h2 className='text-sm font-bold text-[#0F1111] uppercase mb-4'>
              Items
            </h2>
            <div className='space-y-4'>
              {order.items?.map((item) => (
                <div
                  key={item._id}
                  className='flex gap-4 py-3 border-b border-[#D5D9D9] last:border-0'
                >
                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/80x80?text=No+Image"
                    }
                    alt={item.name}
                    className='w-20 h-20 object-cover rounded-lg'
                  />
                  <div className='flex-1'>
                    <Link
                      to={`/product/${item.product?.slug || "#"}`}
                      className='text-sm font-medium text-[#0F1111] hover:text-[#FF9900]'
                    >
                      {item.name}
                    </Link>
                    <p className='text-sm text-[#565959] mt-1'>
                      ${item.price?.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <p className='text-sm font-bold'>
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className='bg-white rounded-lg p-6 shadow-sm space-y-4'>
            <h2 className='text-sm font-bold text-[#0F1111] uppercase'>
              Summary
            </h2>

            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-[#565959]'>Subtotal</span>
                <span>${order.subtotal?.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-[#565959]'>Shipping</span>
                <span>
                  {order.shippingCost === 0
                    ? "FREE"
                    : `$${order.shippingCost?.toFixed(2)}`}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-[#565959]'>Tax</span>
                <span>${order.tax?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className='flex justify-between text-[#067D62]'>
                  <span>Discount</span>
                  <span>-${order.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className='border-t pt-2 flex justify-between font-bold text-base'>
                <span>Total</span>
                <span>${order.total?.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleDownloadInvoice}
              className='flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#F7FAFA] border border-[#D5D9D9] rounded-lg text-sm font-medium text-[#0F1111] hover:bg-white hover:border-[#FF9900] transition-all mt-4'
            >
              <HiArrowDownTray className='w-4 h-4' />
              Download Invoice (PDF)
            </button>

            {/* Tracking */}
            {order.trackingNumber && (
              <div className='bg-[#F7FAFA] rounded-lg p-3'>
                <p className='text-xs text-[#565959]'>Tracking Number</p>
                <p className='text-sm font-bold text-[#0F1111]'>
                  {order.trackingNumber}
                </p>
              </div>
            )}

            {order.estimatedDelivery && (
              <p className='text-xs text-[#565959]'>
                Estimated Delivery:{" "}
                {new Date(order.estimatedDelivery).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Shipping Address */}
          <div className='bg-white rounded-lg p-6 shadow-sm mt-4'>
            <h2 className='text-sm font-bold text-[#0F1111] uppercase mb-3'>
              Shipping Address
            </h2>
            <p className='text-sm text-[#565959]'>
              {order.shippingAddress?.street}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
              {order.shippingAddress?.zipCode}
              <br />
              {order.shippingAddress?.country}
              {order.shippingAddress?.phone && (
                <>
                  <br />
                  📱 {order.shippingAddress.phone}
                </>
              )}
            </p>
          </div>

          {/* Cancel button */}
          {["pending", "confirmed"].includes(order.status) && (
            <Button
              onClick={handleCancel}
              variant='danger'
              size='md'
              className='w-full mt-4'
              disabled={cancelling}
            >
              <HiXMark className='w-4 h-4 mr-1' />
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
