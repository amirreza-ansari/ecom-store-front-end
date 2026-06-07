import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { setUser, logoutUser } from "../features/auth/authSlice";
import { userApi } from "../features/users/userApi";
import { addressApi } from "../features/users/addressApi";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    addressApi
      .getAll()
      .then(({ data }) => setAddresses(data.data.addresses || []))
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
      toast.success("Profile updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
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
      toast.success("Password updated!");
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Failed");
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
    <div className='max-w-[1200px] mx-auto px-4 py-6 md:py-16 min-h-screen bg-white dark:bg-gray-950'>
      <div className='flex flex-col md:flex-row gap-6 md:gap-12'>
        <aside className='w-full md:w-64 shrink-0 flex flex-col gap-4 md:gap-0'>
          <div className='bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 md:p-6 flex flex-row md:flex-col items-center gap-4 md:gap-0 border border-gray-100 dark:border-gray-700 md:mb-6'>
            <div className='w-14 h-14 md:w-20 md:h-20 shrink-0 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-600 md:mb-4'>
              <HiOutlineUser className='w-6 h-6 md:w-8 md:h-8 text-gray-400 dark:text-gray-500' />
            </div>
            <div className='flex flex-col overflow-hidden text-left md:text-center w-full'>
              <h2 className='font-bold text-base md:text-lg text-gray-900 dark:text-white truncate'>
                {user?.name || "User"}
              </h2>
              <p className='text-sm text-gray-500 dark:text-gray-400 truncate w-full'>
                {user?.email}
              </p>
            </div>
          </div>

          <nav className='flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 md:overflow-visible [&::-webkit-scrollbar]:hidden'>
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center shrink-0 gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === item.key
                    ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${activeTab === item.key ? "text-[#FF4500]" : ""}`}
                />
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className='flex items-center shrink-0 gap-2 md:gap-3 px-4 py-2.5 md:py-3 md:mt-4 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all'
            >
              <HiOutlineArrowRightOnRectangle className='w-5 h-5' /> Logout
            </button>
          </nav>
        </aside>

        <main className='flex-1 min-w-0'>
          {activeTab === "overview" && (
            <div className='space-y-6 md:space-y-8 animate-fade-in'>
              <div>
                <h1 className='text-xl md:text-3xl font-extrabold text-black dark:text-white mb-1 md:mb-2'>
                  Welcome, {user?.name?.split(" ")[0]}! 👋
                </h1>
                <p className='text-sm md:text-base text-gray-500 dark:text-gray-400'>
                  Here's what's happening with your account today.
                </p>
              </div>
              <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4'>
                {[
                  { label: "Total Orders", value: 12, action: "orders" },
                  { label: "Wishlist", value: 24, action: "wishlist" },
                  {
                    label: "Addresses",
                    value: addresses.length,
                    action: "addresses",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className='bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-md transition-shadow'
                  >
                    <p className='text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium mb-1 md:mb-2'>
                      {stat.label}
                    </p>
                    <p className='text-2xl md:text-3xl font-bold text-black dark:text-white mb-3 md:mb-4'>
                      {stat.value}
                    </p>
                    <button
                      onClick={() => setActiveTab(stat.action)}
                      className='text-xs md:text-sm font-semibold text-[#FF4500] hover:underline'
                    >
                      View
                    </button>
                  </div>
                ))}
                <div className='bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col justify-between hover:shadow-md transition-shadow'>
                  <div>
                    <p className='text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium mb-2 md:mb-4'>
                      Settings
                    </p>
                    <HiOutlineCog6Tooth className='w-6 h-6 md:w-8 md:h-8 text-black dark:text-white mb-2' />
                  </div>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className='text-xs md:text-sm font-semibold text-[#FF4500] hover:underline text-left'
                  >
                    Update profile
                  </button>
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

          {activeTab === "profile" && (
            <div className='bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl md:rounded-2xl p-5 md:p-8 animate-fade-in'>
              <h2 className='text-lg md:text-xl font-bold text-black dark:text-white mb-4 md:mb-6'>
                Profile Settings
              </h2>
              <form
                onSubmit={handleUpdateProfile}
                className='space-y-4 md:space-y-5 max-w-xl'
              >
                <div>
                  <label className='block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5'>
                    Full Name
                  </label>
                  <input
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='w-full px-4 py-3 bg-[#F0F0F0] dark:bg-gray-700 dark:text-white border border-transparent rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF4500] transition-all'
                  />
                </div>
                <div>
                  <label className='block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5'>
                    Email
                  </label>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='w-full px-4 py-3 bg-[#F0F0F0] dark:bg-gray-700 dark:text-white border border-transparent rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF4500] transition-all'
                  />
                </div>
                {user && !user.isEmailVerified && (
                  <div className='p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900 rounded-xl text-sm text-orange-800 dark:text-orange-400'>
                    <span>Email not verified.</span>
                    <button
                      type='button'
                      className='text-[#FF4500] hover:underline font-bold ml-1'
                    >
                      Resend
                    </button>
                  </div>
                )}
                {user?.isEmailVerified && (
                  <div className='flex items-center gap-2 text-sm text-green-600 dark:text-green-400'>
                    <HiCheck className='w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full p-0.5' />{" "}
                    Email verified
                  </div>
                )}
                <div className='pt-2'>
                  <button
                    type='submit'
                    disabled={saving}
                    className='w-full sm:w-auto bg-[#FF4500] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-[#E03E00] disabled:opacity-70'
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className='bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl md:rounded-2xl p-5 md:p-8 animate-fade-in'>
              <h2 className='text-lg md:text-xl font-bold text-black dark:text-white mb-4 md:mb-6'>
                Change Password
              </h2>
              <form
                onSubmit={handleUpdatePassword}
                className='space-y-4 md:space-y-5 max-w-xl'
              >
                {passwordError && (
                  <div className='p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400'>
                    {passwordError}
                  </div>
                )}
                <div>
                  <label className='block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5'>
                    Current Password
                  </label>
                  <input
                    type='password'
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className='w-full px-4 py-3 bg-[#F0F0F0] dark:bg-gray-700 dark:text-white border border-transparent rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF4500] transition-all'
                  />
                </div>
                <div>
                  <label className='block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5'>
                    New Password
                  </label>
                  <input
                    type='password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className='w-full px-4 py-3 bg-[#F0F0F0] dark:bg-gray-700 dark:text-white border border-transparent rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF4500] transition-all'
                  />
                  <p className='text-xs text-gray-500 dark:text-gray-400 mt-1.5'>
                    Must be at least 6 characters.
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5'>
                    Confirm Password
                  </label>
                  <input
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className='w-full px-4 py-3 bg-[#F0F0F0] dark:bg-gray-700 dark:text-white border border-transparent rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF4500] transition-all'
                  />
                </div>
                <div className='pt-2'>
                  <button
                    type='submit'
                    disabled={saving}
                    className='w-full sm:w-auto bg-black dark:bg-white dark:text-black text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-70'
                  >
                    {saving ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "addresses" && (
            <div className='bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl md:rounded-2xl p-5 md:p-8 animate-fade-in'>
              <div className='flex items-center justify-between mb-4 md:mb-6'>
                <h2 className='text-lg md:text-xl font-bold text-black dark:text-white'>
                  Saved Addresses
                </h2>
                <Link to='/profile/addresses'>
                  <button className='text-sm font-bold text-[#FF4500] hover:underline'>
                    + Add New
                  </button>
                </Link>
              </div>
              {addresses.length === 0 ? (
                <div className='text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700'>
                  <HiOutlineMapPin className='w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3' />
                  <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    No addresses saved yet.
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className='p-4 md:p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors'
                    >
                      <div className='flex justify-between items-start mb-2'>
                        <span className='bg-gray-100 dark:bg-gray-700 text-xs font-bold px-2.5 py-1 rounded-md text-gray-600 dark:text-gray-300'>
                          {addr.label || "Home"}
                        </span>
                      </div>
                      <p className='font-bold text-black dark:text-white text-sm md:text-base mb-1'>
                        {addr.fullName || user?.name}
                      </p>
                      <p className='text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-3 leading-relaxed'>
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
