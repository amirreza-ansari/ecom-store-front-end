import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "./adminApi";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import {
  HiShoppingBag,
  HiCurrencyDollar,
  HiUsers,
  HiStar,
  HiArrowUp,
  HiArrowDown,
} from "react-icons/hi2";

const statusBadges = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, revenueRes, productsRes, ordersRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getRevenue("monthly"),
        adminApi.getTopProducts(5),
        adminApi.getRecentOrders(10),
      ]);
      setStats(statsRes.data.data.stats);
      setRevenue(
        Array.isArray(revenueRes.data)
          ? revenueRes.data
          : revenueRes.data?.data || [],
      );
      setTopProducts(productsRes.data.data.products);
      setRecentOrders(ordersRes.data.data.orders);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex flex-col justify-center items-center h-[60vh] space-y-4'>
        <Spinner size='lg' />
        <p className='text-sm text-[#565959] animate-pulse'>
          Loading dashboard data...
        </p>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "Total Orders",
      value: stats.overview?.totalOrders?.toLocaleString() || 0,
      icon: HiShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Revenue",
      value: `$${(stats.overview?.totalRevenue || 0).toLocaleString()}`,
      icon: HiCurrencyDollar,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Customers",
      value: stats.overview?.totalCustomers?.toLocaleString() || 0,
      icon: HiUsers,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Avg Rating",
      value: stats.overview?.avgRating || "0.0",
      icon: HiStar,
      color: "bg-yellow-50 text-yellow-600",
    },
  ];

  const maxRevenue = Math.max(...revenue.map((r) => r.revenue), 1);

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-[#0F1111]'>Dashboard</h1>
        <p className='text-sm text-[#565959]'>
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {statCards.map((card) => (
          <div
            key={card.label}
            className='bg-white rounded-xl p-5 shadow-sm border border-[#D5D9D9] hover:shadow-md transition-shadow'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-[#565959]'>
                  {card.label}
                </p>
                <p className='text-2xl font-bold text-[#0F1111] mt-1'>
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon className='w-6 h-6' />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* This Month & Growth */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {/* Orders Card */}
        <div className='bg-white rounded-xl p-5 shadow-sm border border-[#D5D9D9] flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-[#565959] uppercase tracking-wider mb-1'>
              This Month Orders
            </p>
            <p className='text-2xl font-bold text-[#0F1111]'>
              {stats.thisMonth?.orders?.toLocaleString() || 0}
            </p>
          </div>
          {/* Example Growth Badge - Wire up to real data if available */}
          <div className='flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium'>
            <HiArrowUp className='w-3 h-3' />
            <span>12%</span>
          </div>
        </div>

        {/* Revenue Card */}
        <div className='bg-white rounded-xl p-5 shadow-sm border border-[#D5D9D9] flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-[#565959] uppercase tracking-wider mb-1'>
              This Month Revenue
            </p>
            <p className='text-2xl font-bold text-[#0F1111]'>
              ${(stats.thisMonth?.revenue || 0).toLocaleString()}
            </p>
          </div>
          <div className='flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium'>
            <HiArrowUp className='w-3 h-3' />
            <span>8.4%</span>
          </div>
        </div>

        {/* Customers Card */}
        <div className='bg-white rounded-xl p-5 shadow-sm border border-[#D5D9D9] flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-[#565959] uppercase tracking-wider mb-1'>
              New Customers
            </p>
            <p className='text-2xl font-bold text-[#0F1111]'>
              {stats.thisMonth?.newCustomers?.toLocaleString() || 0}
            </p>
          </div>
          <div className='flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-medium'>
            <HiArrowDown className='w-3 h-3' />
            <span>2.1%</span>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className='bg-white rounded-xl p-6 shadow-sm border border-[#D5D9D9]'>
        <h2 className='text-sm font-bold text-[#0F1111] uppercase tracking-wider mb-6'>
          Revenue (Last 12 Months)
        </h2>

        {revenue.length > 0 ? (
          <div className='flex gap-4 h-64'>
            {/* Y-Axis Labels (Left Side) */}
            <div className='flex flex-col justify-between text-xs text-[#565959] pb-6 text-right w-14 shrink-0 font-medium'>
              <span>${Math.round(maxRevenue).toLocaleString()}</span>
              <span>${Math.round(maxRevenue / 2).toLocaleString()}</span>
              <span>$0</span>
            </div>

            {/* Chart Area */}
            <div className='flex-1 flex items-end gap-3 border-b-2 border-[#E7E7E7] pb-0 relative'>
              {revenue.map((item, index) => (
                <div
                  key={index}
                  className='flex-1 flex flex-col items-center group relative h-full justify-end max-w-[60px]'
                >
                  {/* Tooltip */}
                  <div className='absolute -top-10 bg-[#1a1a2e] text-white text-xs font-medium rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 pointer-events-none shadow-lg transform translate-y-2 group-hover:translate-y-0'>
                    ${item.revenue?.toLocaleString()}
                  </div>

                  {/* Bar */}
                  <div
                    className='w-full bg-gradient-to-t from-[#FF9900] to-[#FFA41C] rounded-t-md hover:from-[#E88B00] hover:to-[#FF9900] transition-colors cursor-pointer min-h-[4px] shadow-sm'
                    style={{
                      height: `${Math.max((item.revenue / maxRevenue) * 100, 2)}%`,
                    }}
                  />

                  {/* Month Label (X-Axis) */}
                  <span className='text-xs font-medium text-[#565959] absolute -bottom-7'>
                    {item._id ? `M${item._id.slice(-2)}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='h-48 flex flex-col items-center justify-center bg-[#F7FAFA] rounded-lg border border-dashed border-[#D5D9D9]'>
            <HiCurrencyDollar className='w-8 h-8 text-[#D5D9D9] mb-2' />
            <p className='text-sm text-[#565959]'>No revenue data yet</p>
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Top Products */}
        <div className='bg-white rounded-xl p-6 shadow-sm border border-[#D5D9D9]'>
          <h2 className='text-sm font-bold text-[#0F1111] uppercase tracking-wider mb-5'>
            Top Products
          </h2>
          {topProducts.length > 0 ? (
            <div className='space-y-4'>
              {topProducts.map((product, index) => (
                <div
                  key={product._id}
                  className='flex items-center justify-between p-2 hover:bg-[#F7FAFA] rounded-lg transition-colors -mx-2'
                >
                  <div className='flex items-center gap-4'>
                    <div className='w-6 h-6 rounded-full bg-[#FFF8F0] text-[#FF9900] flex items-center justify-center text-xs font-bold'>
                      {index + 1}
                    </div>
                    <div>
                      <p className='text-sm font-medium text-[#0F1111] truncate max-w-[200px]'>
                        {product.name}
                      </p>
                      <p className='text-xs text-[#565959] mt-0.5'>
                        {product.totalSold?.toLocaleString()} sold
                      </p>
                    </div>
                  </div>
                  <span className='text-sm font-bold text-[#0F1111]'>
                    $
                    {product.revenue?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className='h-32 flex items-center justify-center bg-[#F7FAFA] rounded-lg border border-dashed border-[#D5D9D9]'>
              <p className='text-sm text-[#565959]'>No sales data yet</p>
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className='bg-white rounded-xl p-6 shadow-sm border border-[#D5D9D9]'>
          <h2 className='text-sm font-bold text-[#0F1111] uppercase tracking-wider mb-5'>
            Orders by Status
          </h2>
          {stats.ordersByStatus &&
          Object.keys(stats.ordersByStatus).length > 0 ? (
            <div className='space-y-4'>
              {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                <div key={status} className='flex items-center justify-between'>
                  <div className='w-24'>
                    <Badge variant={statusBadges[status] || "neutral"}>
                      {status}
                    </Badge>
                  </div>
                  <div className='flex-1 flex items-center gap-4 ml-4'>
                    <div className='flex-1 h-2 bg-[#F7FAFA] rounded-full overflow-hidden border border-[#E7E7E7]'>
                      <div
                        className='h-full bg-[#FF9900] rounded-full transition-all duration-1000 ease-out'
                        style={{
                          width: `${stats.overview?.totalOrders ? (count / stats.overview.totalOrders) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className='text-sm font-bold text-[#0F1111] w-8 text-right'>
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='h-32 flex items-center justify-center bg-[#F7FAFA] rounded-lg border border-dashed border-[#D5D9D9]'>
              <p className='text-sm text-[#565959]'>No orders yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className='bg-white rounded-xl shadow-sm border border-[#D5D9D9] overflow-hidden'>
        <div className='p-6 border-b border-[#E7E7E7] flex items-center justify-between'>
          <h2 className='text-sm font-bold text-[#0F1111] uppercase tracking-wider'>
            Recent Orders
          </h2>
          <Link
            to='/admin/orders'
            className='text-sm font-medium text-[#FF9900] hover:text-[#E88B00] transition-colors'
          >
            View All &rarr;
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm text-left'>
              <thead className='bg-[#F7FAFA] text-xs uppercase text-[#565959] font-semibold border-b border-[#E7E7E7]'>
                <tr>
                  <th className='py-3 px-6'>Order</th>
                  <th className='py-3 px-6'>Customer</th>
                  <th className='py-3 px-6'>Total</th>
                  <th className='py-3 px-6'>Status</th>
                  <th className='py-3 px-6'>Date</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-[#E7E7E7]'>
                {recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className='hover:bg-[#F7FAFA] transition-colors'
                  >
                    <td className='py-3 px-6 font-medium text-[#0F1111]'>
                      #{order.orderNumber}
                    </td>
                    <td className='py-3 px-6 text-[#565959]'>
                      {order.user?.name || "N/A"}
                    </td>
                    <td className='py-3 px-6 font-medium text-[#0F1111]'>
                      $
                      {order.total?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className='py-3 px-6'>
                      <Badge variant={statusBadges[order.status] || "neutral"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className='py-3 px-6 text-[#565959]'>
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='p-8 text-center text-[#565959] bg-[#F7FAFA]'>
            <p className='text-sm'>No recent orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
