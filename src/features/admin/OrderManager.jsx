import { useState, useEffect } from "react";
import api from "../../utils/axios";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import { HiEye, HiMagnifyingGlass, HiXMark } from "react-icons/hi2";
import toast from "react-hot-toast";
import TableSkeleton from "../../components/ui/TableSkeleton";

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

const allStatuses = [
  "",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const validTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [statusNote, setStatusNote] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/orders/admin/all", { params });
      setOrders(data.data.orders);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const { data } = await api.get(`/orders/admin/${orderId}`);
      setSelectedOrder(data.data.order);
      setTrackingNumber("");
      setStatusNote("");
    } catch (error) {
      toast.error("Failed to load order details");
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      const payload = { status: newStatus, note: statusNote };
      if (newStatus === "shipped" && trackingNumber) {
        payload.trackingNumber = trackingNumber;
      }
      await api.put(`/orders/${orderId}/status`, payload);
      toast.success(`Order status updated to "${newStatus}"`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-bold text-slate-900'>Orders</h1>
        <p className='text-slate-500 text-sm mt-1'>
          Manage and track customer orders.
        </p>
      </div>

      {/* Status Filter */}
      <div className='flex gap-2 flex-wrap'>
        {allStatuses.map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
              statusFilter === status
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {status || "All Orders"}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : orders.length === 0 ? (
          <div className='p-12 text-center text-slate-500'>No orders found</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm text-left'>
              <thead className='bg-slate-50 text-slate-500 uppercase text-xs font-semibold'>
                <tr>
                  <th className='py-4 px-6'>Order</th>
                  <th className='py-4 px-6'>Customer</th>
                  <th className='py-4 px-6'>Total</th>
                  <th className='py-4 px-6'>Payment</th>
                  <th className='py-4 px-6'>Status</th>
                  <th className='py-4 px-6'>Date</th>
                  <th className='py-4 px-6 text-right'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className='hover:bg-slate-50/50 transition-colors'
                  >
                    <td className='py-4 px-6 font-semibold text-slate-900'>
                      #{order.orderNumber}
                    </td>
                    <td className='py-4 px-6 text-slate-700'>
                      {order.user?.name || "N/A"}
                    </td>
                    <td className='py-4 px-6 font-medium'>
                      ${order.total?.toFixed(2)}
                    </td>
                    <td className='py-4 px-6'>
                      <Badge
                        variant={
                          paymentBadges[order.paymentStatus] || "neutral"
                        }
                      >
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className='py-4 px-6'>
                      <Badge variant={statusBadges[order.status] || "neutral"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className='py-4 px-6 text-slate-500'>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className='py-4 px-6 text-right'>
                      <button
                        onClick={() => viewOrderDetails(order._id)}
                        className='p-2 hover:bg-slate-200 rounded-lg text-slate-500'
                      >
                        <HiEye className='w-4 h-4' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={setPage}
        />
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div
            className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm'
            onClick={() => setSelectedOrder(null)}
          />
          <div className='relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8'>
            <div className='flex justify-between items-start mb-6'>
              <div>
                <h2 className='text-xl font-bold text-slate-900'>
                  Order #{selectedOrder.orderNumber}
                </h2>
                <p className='text-slate-500 text-sm'>
                  Customer: {selectedOrder.user?.name} (
                  {selectedOrder.user?.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className='text-slate-400 hover:text-slate-600'
              >
                <HiXMark className='w-6 h-6' />
              </button>
            </div>

            <div className='grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-4 rounded-xl'>
              <div>
                <p className='text-xs font-semibold text-slate-400 uppercase'>
                  Status
                </p>
                <div className='mt-1'>
                  <Badge variant={statusBadges[selectedOrder.status]}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className='text-xs font-semibold text-slate-400 uppercase'>
                  Total Amount
                </p>
                <p className='text-2xl font-bold text-slate-900 mt-1'>
                  ${selectedOrder.total?.toFixed(2)}
                </p>
              </div>
            </div>

            <div className='mb-8'>
              <h3 className='text-sm font-bold text-slate-900 mb-3'>
                Order Items
              </h3>
              <div className='space-y-2'>
                {selectedOrder.items?.map((item) => (
                  <div
                    key={item._id}
                    className='flex justify-between text-sm py-2 border-b border-slate-100 last:border-0'
                  >
                    <span className='text-slate-700'>
                      {item.name}{" "}
                      <span className='text-slate-400'>x{item.quantity}</span>
                    </span>
                    <span className='font-medium text-slate-900'>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {validTransitions[selectedOrder.status]?.length > 0 && (
              <div className='bg-slate-50 p-5 rounded-xl border border-slate-100'>
                <h3 className='text-sm font-bold mb-4'>Change Order Status</h3>
                <div className='space-y-4'>
                  {selectedOrder.status === "processing" && (
                    <input
                      type='text'
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder='Enter tracking number'
                      className='w-full px-4 py-2 text-sm border rounded-lg'
                    />
                  )}
                  <input
                    type='text'
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder='Add a note (optional)'
                    className='w-full px-4 py-2 text-sm border rounded-lg'
                  />
                  <div className='flex gap-2 flex-wrap'>
                    {validTransitions[selectedOrder.status].map((newStatus) => (
                      <Button
                        key={newStatus}
                        size='sm'
                        variant={
                          newStatus === "cancelled" ? "danger" : "primary"
                        }
                        onClick={() =>
                          handleUpdateStatus(selectedOrder._id, newStatus)
                        }
                        disabled={updating}
                      >
                        {updating ? "Updating..." : `Set to ${newStatus}`}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
