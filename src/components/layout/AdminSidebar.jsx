import { NavLink } from "react-router-dom";
import {
  HiChartBar,
  HiShoppingBag,
  HiTag,
  HiClipboardDocumentList,
  HiUsers,
  HiTicket,
  HiArchiveBox,
  HiHome,
  HiXMark,
  HiChatBubbleLeftRight,
} from "react-icons/hi2";

const navItems = [
  { to: "/admin", icon: HiChartBar, label: "Dashboard", end: true },
  { to: "/admin/products", icon: HiShoppingBag, label: "Products" },
  { to: "/admin/categories", icon: HiTag, label: "Categories" },
  { to: "/admin/orders", icon: HiClipboardDocumentList, label: "Orders" },
  { to: "/admin/users", icon: HiUsers, label: "Users" },
  { to: "/admin/coupons", icon: HiTicket, label: "Coupons" },
  { to: "/admin/inventory", icon: HiArchiveBox, label: "Inventory" },
  { to: "/admin/chats", icon: HiChatBubbleLeftRight, label: "Live Chat" },
];

export default function AdminSidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 lg:hidden'
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#1a1a2e] z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className='flex items-center justify-between p-5 border-b border-gray-700'>
          <div className='flex items-center gap-2'>
            <span className='text-xl font-bold text-white'>ecom</span>
            <span className='text-xl font-bold text-[#FF9900]'>store</span>
          </div>
          <span className='text-xs bg-[#FF9900] text-white px-2 py-0.5 rounded'>
            ADMIN
          </span>
          <button onClick={onClose} className='lg:hidden text-white'>
            <HiXMark className='w-5 h-5' />
          </button>
        </div>

        {/* Navigation */}
        <nav className='p-3 space-y-1'>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#FF9900] text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              <item.icon className='w-5 h-5' />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom links */}
        <div className='absolute bottom-0 left-0 right-0 p-3 border-t border-gray-700'>
          <NavLink
            to='/'
            className='flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors'
          >
            <HiHome className='w-5 h-5' />
            Back to Store
          </NavLink>
        </div>
      </aside>
    </>
  );
}
