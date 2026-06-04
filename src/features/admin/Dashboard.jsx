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

  // const fetchAll = async () => {
  //   try {
  //     const [statsRes, revenueRes, productsRes, ordersRes] = await Promise.all([
  //       adminApi.getDashboard(),
  //       adminApi.getRevenue("monthly"),
  //       adminApi.getTopProducts(5),
  //       adminApi.getRecentOrders(10),
  //     ]);
  //     setStats(statsRes.data.stats);
  //     setRevenue(revenueRes.data);
  //     setTopProducts(productsRes.data.data.products);
  //     setRecentOrders(ordersRes.data.data.orders);
  //   } catch (error) {
  //     console.error("Failed to fetch dashboard:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchAll = async () => {
    try {
      const [statsRes, revenueRes, productsRes, ordersRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getRevenue("monthly"),
        adminApi.getTopProducts(5),
        adminApi.getRecentOrders(10),
      ]);
      setStats(statsRes.data.data.stats);
      // Fix: revenue comes as array directly in data
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
      <div className='flex justify-center items-center h-64'>
        <Spinner size='lg' />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "Total Orders",
      value: stats.overview?.totalOrders || 0,
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
      value: stats.overview?.totalCustomers || 0,
      icon: HiUsers,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Avg Rating",
      value: stats.overview?.avgRating || "0",
      icon: HiStar,
      color: "bg-yellow-50 text-yellow-600",
    },
  ];

  const maxRevenue = Math.max(...revenue.map((r) => r.revenue), 1);

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-[#0F1111]'>Dashboard</h1>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {statCards.map((card) => (
          <div
            key={card.label}
            className='bg-white rounded-lg p-5 shadow-sm border border-[#D5D9D9]'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-[#565959]'>{card.label}</p>
                <p className='text-2xl font-bold text-[#0F1111] mt-1'>
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className='w-6 h-6' />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* This Month & Growth */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <div className='bg-white rounded-lg p-4 shadow-sm border'>
          <p className='text-xs text-[#565959] uppercase'>This Month Orders</p>
          <p className='text-xl font-bold'>{stats.thisMonth?.orders || 0}</p>
        </div>
        <div className='bg-white rounded-lg p-4 shadow-sm border'>
          <p className='text-xs text-[#565959] uppercase'>This Month Revenue</p>
          <p className='text-xl font-bold'>
            ${(stats.thisMonth?.revenue || 0).toLocaleString()}
          </p>
        </div>
        <div className='bg-white rounded-lg p-4 shadow-sm border'>
          <p className='text-xs text-[#565959] uppercase'>New Customers</p>
          <p className='text-xl font-bold'>
            {stats.thisMonth?.newCustomers || 0}
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className='bg-white rounded-lg p-6 shadow-sm border'>
        <h2 className='text-sm font-bold text-[#0F1111] uppercase mb-6'>
          Revenue (Last 12 Months)
        </h2>

        {revenue.length > 0 ? (
          <div className='flex gap-4 h-56'>
            {/* Y-Axis Labels (Left Side) */}
            <div className='flex flex-col justify-between text-[10px] text-[#565959] pb-6 text-right w-12 shrink-0'>
              <span>${Math.round(maxRevenue).toLocaleString()}</span>
              <span>${Math.round(maxRevenue / 2).toLocaleString()}</span>
              <span>$0</span>
            </div>

            {/* Chart Area */}
            <div className='flex-1 flex items-end gap-2 border-b border-[#E7E7E7] pb-0 relative'>
              {revenue.map((item, index) => (
                /* Added max-w-[60px] to prevent giant bars, justify-center to keep them centered */
                <div
                  key={index}
                  className='flex-1 flex flex-col items-center group relative h-full justify-end max-w-[60px]'
                >
                  {/* Tooltip */}
                  <div className='absolute -top-8 bg-[#1a1a2e] text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-md'>
                    ${item.revenue?.toLocaleString()}
                  </div>

                  {/* Bar */}
                  <div
                    className='w-full bg-gradient-to-t from-[#FF9900] to-[#FFA41C] rounded-t-sm hover:from-[#E88B00] hover:to-[#FF9900] transition-colors cursor-pointer min-h-[4px]'
                    style={{
                      height: `${Math.max((item.revenue / maxRevenue) * 100, 2)}%`,
                    }}
                  />

                  {/* Month Label (X-Axis) - Positioned absolutely below the border */}
                  <span className='text-[10px] text-[#565959] absolute -bottom-6'>
                    {item._id ? `M${item._id.slice(-2)}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='h-48 flex items-center justify-center'>
            <p className='text-sm text-[#565959]'>No revenue data yet</p>
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Top Products */}
        <div className='bg-white rounded-lg p-6 shadow-sm border'>
          <h2 className='text-sm font-bold text-[#0F1111] uppercase mb-4'>
            Top Products
          </h2>
          {topProducts.length > 0 ? (
            <div className='space-y-3'>
              {topProducts.map((product, index) => (
                <div
                  key={product._id}
                  className='flex items-center justify-between'
                >
                  <div className='flex items-center gap-3'>
                    <span className='text-sm font-bold text-[#565959] w-5'>
                      {index + 1}
                    </span>
                    <div>
                      <p className='text-sm font-medium text-[#0F1111] truncate max-w-[200px]'>
                        {product.name}
                      </p>
                      <p className='text-xs text-[#565959]'>
                        {product.totalSold} sold
                      </p>
                    </div>
                  </div>
                  <span className='text-sm font-medium'>
                    ${product.revenue?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-sm text-[#565959]'>No sales data yet</p>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className='bg-white rounded-lg p-6 shadow-sm border'>
          <h2 className='text-sm font-bold text-[#0F1111] uppercase mb-4'>
            Orders by Status
          </h2>
          {stats.ordersByStatus &&
          Object.keys(stats.ordersByStatus).length > 0 ? (
            <div className='space-y-3'>
              {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                <div key={status} className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Badge variant={statusBadges[status] || "neutral"}>
                      {status}
                    </Badge>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-32 h-2 bg-[#F7FAFA] rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-[#FF9900] rounded-full'
                        style={{
                          width: `${stats.overview?.totalOrders ? (count / stats.overview.totalOrders) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className='text-sm font-medium w-6 text-right'>
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-sm text-[#565959]'>No orders yet</p>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className='bg-white rounded-lg p-6 shadow-sm border'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-sm font-bold text-[#0F1111] uppercase'>
            Recent Orders
          </h2>
          <Link
            to='/admin/orders'
            className='text-xs text-[#FF9900] hover:underline'
          >
            View All
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-[#D5D9D9]'>
                  <th className='text-left py-2 px-3 text-[#565959] font-medium'>
                    Order
                  </th>
                  <th className='text-left py-2 px-3 text-[#565959] font-medium'>
                    Customer
                  </th>
                  <th className='text-left py-2 px-3 text-[#565959] font-medium'>
                    Total
                  </th>
                  <th className='text-left py-2 px-3 text-[#565959] font-medium'>
                    Status
                  </th>
                  <th className='text-left py-2 px-3 text-[#565959] font-medium'>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className='border-b border-[#D5D9D9] hover:bg-[#F7FAFA]'
                  >
                    <td className='py-2 px-3 font-medium'>
                      #{order.orderNumber}
                    </td>
                    <td className='py-2 px-3'>{order.user?.name || "N/A"}</td>
                    <td className='py-2 px-3'>${order.total?.toFixed(2)}</td>
                    <td className='py-2 px-3'>
                      <Badge variant={statusBadges[order.status] || "neutral"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className='py-2 px-3 text-[#565959]'>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className='text-sm text-[#565959]'>No orders yet</p>
        )}
      </div>
    </div>
  );
}
