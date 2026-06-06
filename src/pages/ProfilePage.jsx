import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { setUser, logoutUser } from "../features/auth/authSlice";
import { userApi } from "../features/users/userApi";
import { addressApi } from "../features/users/addressApi";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// UI Components
import Button from "../components/ui/Button"; // Assuming you use this elsewhere
import {
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineMapPin,
  HiOutlineCog6Tooth,
  HiOutlineShieldCheck,
  HiOutlineArrowRightOnRectangle,
  HiCheck,
} from "react-icons/hi2";

import OrderHistoryPage from "./OrderHistoryPage";
import WishlistPage from "./WishlistPage";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    addressApi
      .getAll()
      .then(({ data }) => {
        setAddresses(data.data.addresses || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userApi.updateProfile({ name, email });
      dispatch(setUser(data.data.user));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("New Password cannot be the same as current password");
      return;
    }

    setSaving(true);
    try {
      await userApi.updatePassword({
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!");
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || "Failed to update password",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  const navItems = [
    { key: "overview", label: "Overview", icon: HiOutlineUser },
    { key: "orders", label: "Orders", icon: HiOutlineShoppingBag },
    { key: "wishlist", label: "Wishlist", icon: HiOutlineHeart },
    { key: "addresses", label: "Addresses", icon: HiOutlineMapPin },
    { key: "profile", label: "Profile", icon: HiOutlineCog6Tooth },
    { key: "security", label: "Security", icon: HiOutlineShieldCheck },
  ];

  return (
    <div className='max-w-[1200px] mx-auto px-4 py-6 md:py-16'>
      <div className='flex flex-col md:flex-row gap-6 md:gap-12'>
        {/* Sidebar */}
        <aside className='w-full md:w-64 shrink-0 flex flex-col gap-4 md:gap-0'>
          {/* User Avatar Card - Compact on Mobile, Stacked on Desktop */}
          <div className='bg-gray-50 rounded-2xl p-4 md:p-6 flex flex-row md:flex-col items-center gap-4 md:gap-0 border border-gray-100 md:mb-6'>
            <div className='w-14 h-14 md:w-20 md:h-20 shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 md:mb-4'>
              <HiOutlineUser className='w-6 h-6 md:w-8 md:h-8 text-gray-400' />
            </div>
            <div className='flex flex-col overflow-hidden text-left md:text-center w-full'>
              <h2 className='font-bold text-base md:text-lg text-gray-900 truncate'>
                {user?.name || "User"}
              </h2>
              <p className='text-sm text-gray-500 truncate w-full'>
                {user?.email}
              </p>
            </div>
          </div>

          {/* Navigation Links - Horizontal scroll on Mobile, Vertical on Desktop */}
          <nav className='flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center shrink-0 gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === item.key
                    ? "bg-gray-100 text-black"
                    : "text-gray-500 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${activeTab === item.key ? "text-[#FF4500]" : ""}`}
                />
                {item.label}
              </button>
            ))}
            {/* Desktop Only Logout (Mobile can have this at the bottom of settings, or keep here if desired) */}
            <button
              onClick={handleLogout}
              className='flex items-center shrink-0 gap-2 md:gap-3 px-4 py-2.5 md:py-3 md:mt-4 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all'
            >
              <HiOutlineArrowRightOnRectangle className='w-5 h-5' />
              Logout
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className='flex-1 min-w-0'>
          {/* TAB: Overview Dashboard */}
          {activeTab === "overview" && (
            <div className='space-y-6 md:space-y-8 animate-fade-in'>
              <div>
                <h1 className='text-xl md:text-3xl font-extrabold text-black mb-1 md:mb-2'>
                  Welcome, {user?.name?.split(" ")[0]}! 👋
                </h1>
                <p className='text-sm md:text-base text-gray-500'>
                  Here's what's happening with your account today.
                </p>
              </div>

              {/* Stats Grid */}
              <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4'>
                <div className='bg-white border border-gray-100 shadow-sm rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-md transition-shadow'>
                  <p className='text-xs md:text-sm text-gray-500 font-medium mb-1 md:mb-2'>
                    Total Orders
                  </p>
                  <p className='text-2xl md:text-3xl font-bold text-black mb-3 md:mb-4'>
                    12
                  </p>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className='text-xs md:text-sm font-semibold text-[#FF4500] hover:underline'
                  >
                    View orders
                  </button>
                </div>
                <div className='bg-white border border-gray-100 shadow-sm rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-md transition-shadow'>
                  <p className='text-xs md:text-sm text-gray-500 font-medium mb-1 md:mb-2'>
                    Wishlist
                  </p>
                  <p className='text-2xl md:text-3xl font-bold text-black mb-3 md:mb-4'>
                    24
                  </p>
                  <button
                    onClick={() => setActiveTab("wishlist")}
                    className='text-xs md:text-sm font-semibold text-[#FF4500] hover:underline'
                  >
                    View wishlist
                  </button>
                </div>
                <div className='bg-white border border-gray-100 shadow-sm rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-md transition-shadow'>
                  <p className='text-xs md:text-sm text-gray-500 font-medium mb-1 md:mb-2'>
                    Addresses
                  </p>
                  <p className='text-2xl md:text-3xl font-bold text-black mb-3 md:mb-4'>
                    {addresses.length}
                  </p>
                  <button
                    onClick={() => setActiveTab("addresses")}
                    className='text-xs md:text-sm font-semibold text-[#FF4500] hover:underline'
                  >
                    Manage
                  </button>
                </div>
                <div className='bg-white border border-gray-100 shadow-sm rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col justify-between hover:shadow-md transition-shadow'>
                  <div>
                    <p className='text-xs md:text-sm text-gray-500 font-medium mb-2 md:mb-4'>
                      Settings
                    </p>
                    <HiOutlineCog6Tooth className='w-6 h-6 md:w-8 md:h-8 text-black mb-2' />
                  </div>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className='text-xs md:text-sm font-semibold text-[#FF4500] hover:underline text-left'
                  >
                    Update profile
                  </button>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className='bg-white border border-gray-100 shadow-sm rounded-xl md:rounded-2xl p-4 md:p-6'>
                <div className='flex justify-between items-center mb-4 md:mb-6'>
                  <h3 className='font-bold text-base md:text-lg text-black'>
                    Recent Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className='text-xs md:text-sm font-semibold text-gray-500 hover:text-black'
                  >
                    View All
                  </button>
                </div>
                <div className='space-y-3 md:space-y-4'>
                  {[
                    {
                      id: "#OR21C345",
                      date: "May 12, 2024",
                      status: "Delivered",
                      price: "$249.99",
                    },
                    {
                      id: "#OR21C344",
                      date: "May 10, 2024",
                      status: "Shipped",
                      price: "$1,099.99",
                    },
                    {
                      id: "#OR21E343",
                      date: "May 02, 2024",
                      status: "Delivered",
                      price: "$129.99",
                    },
                  ].map((order, i) => (
                    <div
                      key={i}
                      className='flex flex-wrap sm:flex-nowrap items-center justify-between py-3 border-b border-gray-50 last:border-0 gap-2'
                    >
                      <div className='w-full sm:w-auto'>
                        <p className='font-semibold text-sm text-black'>
                          {order.id}
                        </p>
                        <p className='text-xs text-gray-500'>{order.date}</p>
                      </div>
                      <div className='flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 md:gap-8 mt-1 sm:mt-0'>
                        <span className='text-xs md:text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-md sm:bg-transparent sm:p-0'>
                          {order.status}
                        </span>
                        <span className='font-bold text-sm text-black text-right'>
                          {order.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className='animate-fade-in'>
              <OrderHistoryPage />
            </div>
          )}

          {activeTab === "wishlist" && (
            <div className='animate-fade-in'>
              <WishlistPage />
            </div>
          )}

          {/* TAB: Profile Settings */}
          {activeTab === "profile" && (
            <div className='bg-white border border-gray-100 shadow-sm rounded-xl md:rounded-2xl p-5 md:p-8 animate-fade-in'>
              <h2 className='text-lg md:text-xl font-bold text-black mb-4 md:mb-6'>
                Profile Settings
              </h2>
              <form
                onSubmit={handleUpdateProfile}
                className='space-y-4 md:space-y-5 max-w-xl'
              >
                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-1.5 md:mb-2'>
                    Full Name
                  </label>
                  <input
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='w-full px-4 py-3 text-base md:text-sm bg-[#F0F0F0] border border-transparent rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent transition-all'
                  />
                </div>
                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-1.5 md:mb-2'>
                    Email Address
                  </label>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='w-full px-4 py-3 text-base md:text-sm bg-[#F0F0F0] border border-transparent rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent transition-all'
                  />
                </div>

                {/* Email Verification Status */}
                {user && !user.isEmailVerified && (
                  <div className='p-3 md:p-4 bg-orange-50 border border-orange-100 rounded-xl text-xs md:text-sm text-orange-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2'>
                    <span>Your email is not verified.</span>
                    <button
                      type='button'
                      className='text-[#FF4500] hover:underline font-bold'
                    >
                      Resend link
                    </button>
                  </div>
                )}
                {user?.isEmailVerified && (
                  <div className='flex items-center gap-2 text-xs md:text-sm text-green-600 font-medium'>
                    <HiCheck className='w-4 h-4 md:w-5 md:h-5 bg-green-100 rounded-full p-0.5' />{" "}
                    Email verified
                  </div>
                )}

                <div className='pt-2 md:pt-4'>
                  <button
                    type='submit'
                    disabled={saving}
                    className='w-full sm:w-auto bg-[#FF4500] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-[#E03E00] transition-colors disabled:opacity-70'
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: Security / Password */}
          {activeTab === "security" && (
            <div className='bg-white border border-gray-100 shadow-sm rounded-xl md:rounded-2xl p-5 md:p-8 animate-fade-in'>
              <h2 className='text-lg md:text-xl font-bold text-black mb-4 md:mb-6'>
                Change Password
              </h2>
              <form
                onSubmit={handleUpdatePassword}
                className='space-y-4 md:space-y-5 max-w-xl'
              >
                {passwordError && (
                  <div className='p-3 md:p-4 bg-red-50 border border-red-100 rounded-xl text-xs md:text-sm text-red-600 font-medium'>
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-1.5 md:mb-2'>
                    Current Password
                  </label>
                  <input
                    type='password'
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className='w-full px-4 py-3 text-base md:text-sm bg-[#F0F0F0] border border-transparent rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent transition-all'
                  />
                </div>
                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-1.5 md:mb-2'>
                    New Password
                  </label>
                  <input
                    type='password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className='w-full px-4 py-3 text-base md:text-sm bg-[#F0F0F0] border border-transparent rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent transition-all'
                  />
                  <p className='text-xs text-gray-500 mt-1.5 md:mt-2'>
                    Must be at least 6 characters long.
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-1.5 md:mb-2'>
                    Confirm New Password
                  </label>
                  <input
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className='w-full px-4 py-3 text-base md:text-sm bg-[#F0F0F0] border border-transparent rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent transition-all'
                  />
                </div>

                <div className='pt-2 md:pt-4'>
                  <button
                    type='submit'
                    disabled={saving}
                    className='w-full sm:w-auto bg-black text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-70'
                  >
                    {saving ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: Addresses */}
          {activeTab === "addresses" && (
            <div className='bg-white border border-gray-100 shadow-sm rounded-xl md:rounded-2xl p-5 md:p-8 animate-fade-in'>
              <div className='flex items-center justify-between mb-4 md:mb-6'>
                <h2 className='text-lg md:text-xl font-bold text-black'>
                  Saved Addresses
                </h2>
                <Link to='/profile/addresses'>
                  <button className='text-sm font-bold text-[#FF4500] hover:underline'>
                    + Add New
                  </button>
                </Link>
              </div>

              {addresses.length === 0 ? (
                <div className='text-center py-8 md:py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200'>
                  <HiOutlineMapPin className='w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-2 md:mb-3' />
                  <p className='text-sm font-medium text-gray-500'>
                    No addresses saved yet.
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className='p-4 md:p-5 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors'
                    >
                      <div className='flex justify-between items-start mb-2'>
                        <span className='bg-gray-100 text-xs font-bold px-2.5 py-1 rounded-md text-gray-600'>
                          {addr.label || "Home"}
                        </span>
                      </div>
                      <p className='font-bold text-black text-sm md:text-base mb-1'>
                        {addr.fullName || user?.name}
                      </p>
                      <p className='text-xs md:text-sm text-gray-500 mb-3 md:mb-4 leading-relaxed'>
                        {addr.street},<br />
                        {addr.city}, {addr.state} {addr.zipCode}
                      </p>
                      <Link
                        to={`/profile/addresses/edit/${addr._id}`}
                        className='text-sm font-bold text-[#FF4500] hover:underline'
                      >
                        Edit
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
