import { useState, useEffect } from "react";
import api from "../../utils/axios";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import { HiEye, HiMagnifyingGlass } from "react-icons/hi2";
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
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-[#0F1111]'>Orders</h1>

      {/* Status Filter */}
      <div className='flex gap-2 flex-wrap'>
        {allStatuses.map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              statusFilter === status
                ? "bg-[#FF9900] text-white font-medium"
                : "bg-white text-[#565959] hover:bg-[#F7FAFA] border border-[#D5D9D9]"
            }`}
          >
            {status || "All"}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className='bg-white rounded-lg shadow-sm border overflow-x-auto'>
        {loading ? (
          <div className='p-8 flex justify-center'>
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
          <div className='p-8 text-center text-[#565959]'>No orders found</div>
        ) : (
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-[#D5D9D9] bg-[#F7FAFA]'>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Order
                </th>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Customer
                </th>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Total
                </th>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Payment
                </th>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Status
                </th>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Date
                </th>
                <th className='text-right py-3 px-4 font-medium text-[#565959]'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className='border-b border-[#D5D9D9] hover:bg-[#F7FAFA]'
                >
                  <td className='py-3 px-4 font-medium'>
                    #{order.orderNumber}
                  </td>
                  <td className='py-3 px-4'>{order.user?.name || "N/A"}</td>
                  <td className='py-3 px-4 font-medium'>
                    ${order.total?.toFixed(2)}
                  </td>
                  <td className='py-3 px-4'>
                    <Badge
                      variant={paymentBadges[order.paymentStatus] || "neutral"}
                    >
                      {order.paymentStatus}
                    </Badge>
                  </td>
                  <td className='py-3 px-4'>
                    <Badge variant={statusBadges[order.status] || "neutral"}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className='py-3 px-4 text-[#565959] text-xs'>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className='py-3 px-4 text-right'>
                    <button
                      onClick={() => viewOrderDetails(order._id)}
                      className='p-1.5 hover:bg-[#F7FAFA] rounded text-[#FF9900]'
                    >
                      <HiEye className='w-4 h-4' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            className='fixed inset-0 bg-black/50'
            onClick={() => setSelectedOrder(null)}
          />
          <div className='relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6'>
            <h2 className='text-lg font-bold mb-4'>
              Order #{selectedOrder.orderNumber}
            </h2>

            {/* Customer Info */}
            <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
              <div>
                <p className='text-[#565959]'>Customer</p>
                <p className='font-medium'>{selectedOrder.user?.name}</p>
                <p className='text-xs text-[#565959]'>
                  {selectedOrder.user?.email}
                </p>
              </div>
              <div>
                <p className='text-[#565959]'>Total</p>
                <p className='font-bold text-lg'>
                  ${selectedOrder.total?.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Current Status */}
            <div className='flex items-center gap-3 mb-4'>
              <span className='text-sm text-[#565959]'>Current Status:</span>
              <Badge variant={statusBadges[selectedOrder.status] || "neutral"}>
                {selectedOrder.status}
              </Badge>
              <Badge
                variant={
                  paymentBadges[selectedOrder.paymentStatus] || "neutral"
                }
              >
                {selectedOrder.paymentStatus}
              </Badge>
            </div>

            {/* Items */}
            <div className='mb-4'>
              <h3 className='text-sm font-bold mb-2'>Items</h3>
              {selectedOrder.items?.map((item) => (
                <div
                  key={item._id}
                  className='flex justify-between text-sm py-2 border-b'
                >
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span className='font-medium'>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Status History */}
            {selectedOrder.statusHistory?.length > 0 && (
              <div className='mb-4'>
                <h3 className='text-sm font-bold mb-2'>Status History</h3>
                <div className='space-y-2 text-xs'>
                  {selectedOrder.statusHistory.map((entry, i) => (
                    <div
                      key={i}
                      className='flex justify-between text-[#565959]'
                    >
                      <span className='capitalize'>{entry.status}</span>
                      <span>{new Date(entry.date).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Update Status */}
            {validTransitions[selectedOrder.status]?.length > 0 && (
              <div className='border-t pt-4'>
                <h3 className='text-sm font-bold mb-3'>Update Status</h3>
                <div className='space-y-3'>
                  {selectedOrder.status === "processing" && (
                    <div>
                      <label className='block text-xs mb-1'>
                        Tracking Number
                      </label>
                      <input
                        type='text'
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder='Enter tracking number'
                        className='w-full px-3 py-2 text-sm border rounded-lg'
                      />
                    </div>
                  )}
                  <div>
                    <label className='block text-xs mb-1'>
                      Note (optional)
                    </label>
                    <input
                      type='text'
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder='Add a note'
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
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
                        {updating ? "..." : `Mark as ${newStatus}`}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className='mt-4'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
