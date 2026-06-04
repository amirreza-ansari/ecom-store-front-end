import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../features/orders/orderApi";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import Pagination from "../components/ui/Pagination";
import { HiShoppingBag, HiChevronRight } from "react-icons/hi2";
import OrderCardSkeleton from "../features/orders/OrderCardSkeleton";

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

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await orderApi.getAll(params);
      setOrders(data.data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const statuses = [
    "",
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (loading && orders.length === 0) {
    return (
      <div className='space-y-4'>
        {[...Array(5)].map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto px-4 py-6'>
      <h1 className='text-2xl font-bold text-[#0F1111] mb-6'>My Orders</h1>

      {/* Status Filter */}
      <div className='flex gap-2 mb-6 overflow-x-auto pb-2'>
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
            className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
              statusFilter === status
                ? "bg-[#FF9900] text-white font-medium"
                : "bg-[#F7FAFA] text-[#565959] hover:bg-[#D5D9D9]"
            }`}
          >
            {status || "All Orders"}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className='text-center py-16'>
          <HiShoppingBag className='w-20 h-20 text-[#D5D9D9] mx-auto mb-4' />
          <h2 className='text-lg font-semibold text-[#0F1111] mb-2'>
            No orders found
          </h2>
          <p className='text-[#565959] mb-6'>
            Start shopping to see your orders here.
          </p>
          <Link to='/shop'>
            <Button variant='primary'>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className='space-y-4'>
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className='block bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow border border-[#D5D9D9] hover:border-[#FF9900]'
            >
              <div className='flex items-center justify-between mb-3'>
                <div>
                  <p className='text-xs text-[#565959]'>
                    Order #{order.orderNumber}
                  </p>
                  <p className='text-sm text-[#565959]'>
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant={statusBadges[order.status] || "neutral"}>
                    {order.status}
                  </Badge>
                  <Badge
                    variant={paymentBadges[order.paymentStatus] || "neutral"}
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-lg font-bold text-[#0F1111]'>
                    ${order.total?.toFixed(2)}
                  </p>
                  <p className='text-xs text-[#565959]'>
                    {order.items?.length || 0} item
                    {order.items?.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <HiChevronRight className='w-5 h-5 text-[#565959]' />
              </div>

              {/* Tracking */}
              {order.trackingNumber && (
                <p className='text-xs text-[#565959] mt-2'>
                  📦 Tracking:{" "}
                  <span className='font-medium'>{order.trackingNumber}</span>
                </p>
              )}
            </Link>
          ))}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className='mt-6'>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
