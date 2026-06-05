import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  HiOutlineShoppingCart,
  HiOutlineHeart,
  HiOutlineUser,
  HiBars3,
  HiXMark,
  HiChevronDown,
} from "react-icons/hi2";
import SearchBar from "../ui/SearchBar";
import { logoutUser } from "../../features/auth/authSlice";
import LoginModal from "../../features/auth/LoginModal";
import RegisterModal from "../../features/auth/RegisterModal";
import ForgotPasswordModal from "../../features/auth/ForgotPasswordModal";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    dispatch(logoutUser());
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className='bg-black text-white text-xs md:text-sm text-center py-2.5 font-light'>
        Sign up and get 20% off to your first order.{" "}
        <button
          onClick={() => setRegisterOpen(true)}
          className='font-medium underline hover:text-[#FF4500] transition-colors ml-1'
        >
          Sign Up Now
        </button>
      </div>

      <header className='bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm'>
        <div className='flex items-center justify-between px-4 py-4 max-w-[1400px] mx-auto gap-4 md:gap-8 relative z-50'>
          {/* Left: Logo & Categories */}
          <div className='flex items-center gap-6 md:gap-10 shrink-0'>
            {/* Mobile Menu Toggle */}
            <button
              type='button'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='lg:hidden p-1 text-black'
            >
              {mobileMenuOpen ? (
                <HiXMark className='w-7 h-7' />
              ) : (
                <HiBars3 className='w-7 h-7' />
              )}
            </button>

            <Link
              to='/'
              className=' text-2xl md:text-3xl font-extrabold tracking-tighter text-black'
            >
              <span
                className={`font-bold text-black tracking-tight transition-all duration-300 text-3xl`}
              >
                ecom
              </span>
              <span
                className={`font-bold text-[#FF9900] tracking-tight transition-all duration-300 text-3xl`}
              >
                store
              </span>
            </Link>

            {/* Desktop Categories Dropdown */}
            <div className='hidden lg:flex items-center gap-2 cursor-pointer text-gray-700 hover:text-black transition-colors group relative'>
              <HiBars3 className='w-5 h-5' />
              <span className='font-medium text-sm'>All Categories</span>
              <HiChevronDown className='w-4 h-4' />

              {/* Dropdown Menu (Hover) */}
              <div className='absolute top-full left-0 mt-4 w-48 bg-white border border-gray-100 shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden'>
                <Link
                  to='/shop'
                  className='block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50'
                >
                  Shop All
                </Link>
                <Link
                  to='/shop?isFeatured=true'
                  className='block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50'
                >
                  Featured
                </Link>
                <Link
                  to='/shop?sort=-createdAt'
                  className='block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50'
                >
                  New Arrivals
                </Link>
              </div>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className='hidden md:block flex-1 max-w-2xl bg-[#F0F0F0] rounded-full'>
            {/* Assuming SearchBar has a transparent background to blend with this wrapper */}
            <SearchBar />
          </div>

          {/* Right: Actions */}
          <div className='flex items-center gap-4 lg:gap-6 shrink-0 text-black'>
            {/* Account / User Menu */}
            <div className='relative group flex items-center gap-2 cursor-pointer hover:text-[#FF4500] transition-colors'>
              <HiOutlineUser className='w-6 h-6' />
              <span className='hidden lg:block text-sm font-medium'>
                Account
              </span>

              <div className='absolute right-0 top-full mt-4 w-56 bg-white border border-gray-100 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden text-black'>
                {isAuthenticated ? (
                  <>
                    <div className='px-4 py-3 border-b border-gray-50 bg-gray-50/50'>
                      <p className='text-sm font-semibold truncate'>
                        {user?.name}
                      </p>
                      <p className='text-xs text-gray-500 truncate'>
                        {user?.email}
                      </p>
                    </div>
                    <div className='py-2'>
                      <Link
                        to='/profile'
                        className='block px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#FF4500]'
                      >
                        Profile
                      </Link>
                      <Link
                        to='/orders'
                        className='block px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#FF4500]'
                      >
                        Orders
                      </Link>
                      {user?.role === "admin" && (
                        <Link
                          to='/admin'
                          className='block px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#FF4500]'
                        >
                          Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className='border-t border-gray-50 py-2'>
                      <button
                        onClick={handleLogout}
                        className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50'
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className='py-2'>
                    <button
                      onClick={() => setLoginOpen(true)}
                      className='block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#FF4500]'
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setRegisterOpen(true)}
                      className='block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 hover:text-[#FF4500]'
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Wishlist */}
            <Link
              to='/wishlist'
              className='flex items-center gap-2 hover:text-[#FF4500] transition-colors relative group'
            >
              <div className='relative'>
                <HiOutlineHeart className='w-6 h-6 group-hover:scale-110 transition-transform' />
                {wishlistItems.length > 0 && (
                  <span className='absolute -top-1 -right-1 bg-[#FF4500] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white'>
                    {wishlistItems.length}
                  </span>
                )}
              </div>
              <span className='hidden lg:block text-sm font-medium'>
                Wishlist
              </span>
            </Link>

            {/* Cart */}
            <Link
              to='/cart'
              className='flex items-center gap-2 hover:text-[#FF4500] transition-colors relative group'
            >
              <div className='relative'>
                <HiOutlineShoppingCart className='w-6 h-6 group-hover:scale-110 transition-transform' />
                {totalItems > 0 && (
                  <span className='absolute -top-1 -right-1 bg-[#FF4500] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white'>
                    {totalItems}
                  </span>
                )}
              </div>
              <span className='hidden lg:block text-sm font-medium'>Cart</span>
            </Link>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl transition-all duration-300 origin-top ${
            mobileMenuOpen
              ? "opacity-100 scale-y-100 visible"
              : "opacity-0 scale-y-95 invisible"
          }`}
        >
          <div className='px-4 py-6 flex flex-col gap-4'>
            <div className='md:hidden bg-[#F0F0F0] rounded-full'>
              <SearchBar />
            </div>
            <nav className='flex flex-col gap-2'>
              <Link
                to='/'
                className='px-2 py-2 text-base font-medium text-gray-800'
              >
                Home
              </Link>
              <Link
                to='/shop'
                className='px-2 py-2 text-base font-medium text-gray-800'
              >
                All Categories
              </Link>
              <Link
                to='/shop?isFeatured=true'
                className='px-2 py-2 text-base font-medium text-gray-800'
              >
                Featured
              </Link>
              <Link
                to='/orders'
                className='px-2 py-2 text-base font-medium text-gray-800'
              >
                My Orders
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Modals */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
        onSwitchToForgot={() => {
          setLoginOpen(false);
          setForgotOpen(true);
        }}
      />
      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />
      <ForgotPasswordModal
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onSwitchToLogin={() => {
          setForgotOpen(false);
          setLoginOpen(true);
        }}
      />
    </>
  );
}
