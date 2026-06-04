import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  HiShoppingCart,
  HiHeart,
  HiUser,
  HiBars3,
  HiXMark,
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
  const [scrolled, setScrolled] = useState(false);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect scroll for shrink effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  return (
    <>
      {/* Announcement Bar */}
      <div
        className={`bg-[#FF9900] text-white text-xs text-center py-1.5 font-medium transition-all duration-300 overflow-hidden ${
          scrolled ? "max-h-0 py-0 opacity-0" : "max-h-8 opacity-100"
        }`}
      >
        🚀 Free shipping on orders over $100 &nbsp;|&nbsp; 🔥 Summer Sale up to
        50% off &nbsp;|&nbsp; ⚡ Same-day dispatch
      </div>

      <header
        className={`bg-[#131A22] sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? "shadow-2xl" : "shadow-md"
        }`}
      >
        {/* Main Header */}
        <div
          className={`flex items-center px-4 gap-4 max-w-7xl mx-auto transition-all duration-300 ${
            scrolled ? "py-1.5" : "py-2"
          }`}
        >
          {/* Logo */}
          <Link to='/' className='flex items-center gap-1 shrink-0'>
            <span
              className={`font-bold text-white tracking-tight transition-all duration-300 ${
                scrolled ? "text-xl" : "text-2xl"
              }`}
            >
              ecom
            </span>
            <span
              className={`font-bold text-[#FF9900] tracking-tight transition-all duration-300 ${
                scrolled ? "text-xl" : "text-2xl"
              }`}
            >
              store
            </span>
          </Link>

          {/* Search - hidden on mobile when scrolled */}
          <div
            className={`hidden md:block flex-1 transition-all duration-300 ${
              scrolled ? "opacity-90" : "opacity-100"
            }`}
          >
            <SearchBar />
          </div>

          {/* Right Icons */}
          <div
            className={`flex items-center gap-1 shrink-0 transition-all duration-300 ${
              scrolled ? "scale-90" : "scale-100"
            }`}
          >
            {/* Wishlist */}
            <Link
              to='/wishlist'
              className='relative p-2 text-white hover:text-[#FF9900] transition-colors group'
            >
              <HiHeart className='w-6 h-6 group-hover:scale-110 transition-transform' />
              {wishlistItems.length > 0 && (
                <span className='absolute -top-0.5 -right-0.5 bg-[#FF9900] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse'>
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to='/cart'
              className='relative p-2 text-white hover:text-[#FF9900] transition-colors group'
            >
              <HiShoppingCart className='w-6 h-6 group-hover:scale-110 transition-transform' />
              {totalItems > 0 && (
                <span className='absolute -top-0.5 -right-0.5 bg-[#FF9900] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center'>
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className='relative group'>
              <button className='p-2 text-white hover:text-[#FF9900] transition-colors'>
                <HiUser className='w-6 h-6 group-hover:scale-110 transition-transform' />
              </button>
              <div className='absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-[#D5D9D9] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'>
                {isAuthenticated ? (
                  <>
                    <div className='px-4 py-3 border-b border-[#D5D9D9]'>
                      <p className='text-sm font-medium text-[#0F1111]'>
                        {user?.name}
                      </p>
                      <p className='text-xs text-[#565959]'>{user?.email}</p>
                    </div>
                    <Link
                      to='/profile'
                      className='block px-4 py-2 text-sm text-[#0F1111] hover:bg-[#F7FAFA]'
                    >
                      Profile
                    </Link>
                    <Link
                      to='/orders'
                      className='block px-4 py-2 text-sm text-[#0F1111] hover:bg-[#F7FAFA]'
                    >
                      Orders
                    </Link>
                    {user?.role === "admin" && (
                      <Link
                        to='/admin'
                        className='block px-4 py-2 text-sm text-[#0F1111] hover:bg-[#F7FAFA]'
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className='block w-full text-left px-4 py-2 text-sm text-[#B12704] hover:bg-[#F7FAFA] rounded-b-xl'
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setLoginOpen(true)}
                      className='block w-full text-left px-4 py-2 text-sm text-[#0F1111] hover:bg-[#F7FAFA] rounded-t-xl'
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setRegisterOpen(true)}
                      className='block w-full text-left px-4 py-2 text-sm text-[#0F1111] hover:bg-[#F7FAFA] rounded-b-xl'
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='md:hidden p-2 text-white hover:text-[#FF9900]'
            >
              {mobileMenuOpen ? (
                <HiXMark className='w-6 h-6' />
              ) : (
                <HiBars3 className='w-6 h-6' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div
          className={`md:hidden px-4 pb-2 transition-all duration-300 ${
            scrolled ? "opacity-90" : "opacity-100"
          }`}
        >
          <SearchBar />
        </div>

        {/* Bottom Navigation */}
        <nav
          className={`bg-[#232F3E] hidden md:block transition-all duration-300 ${
            scrolled
              ? "py-0 max-h-0 opacity-0 overflow-hidden"
              : "py-0 max-h-10 opacity-100"
          }`}
        >
          <div className='max-w-7xl mx-auto flex px-4'>
            <Link
              to='/'
              className='px-3 py-2 text-sm text-white hover:text-[#FF9900] transition-colors'
            >
              Home
            </Link>
            <Link
              to='/shop'
              className='px-3 py-2 text-sm text-white hover:text-[#FF9900] transition-colors'
            >
              Shop
            </Link>
            <Link
              to='/shop?isFeatured=true'
              className='px-3 py-2 text-sm text-white hover:text-[#FF9900] transition-colors'
            >
              Featured
            </Link>
            <Link
              to='/shop?sort=-createdAt'
              className='px-3 py-2 text-sm text-white hover:text-[#FF9900] transition-colors'
            >
              New Arrivals
            </Link>
            <Link
              to='/orders'
              className='px-3 py-2 text-sm text-white hover:text-[#FF9900] transition-colors'
            >
              Orders
            </Link>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            mobileMenuOpen ? "max-h-64" : "max-h-0"
          }`}
        >
          <div className='bg-[#232F3E] border-t border-gray-700'>
            <Link
              to='/'
              className='block px-4 py-3 text-sm text-white hover:bg-[#131A22]'
            >
              Home
            </Link>
            <Link
              to='/shop'
              className='block px-4 py-3 text-sm text-white hover:bg-[#131A22]'
            >
              Shop
            </Link>
            <Link
              to='/cart'
              className='block px-4 py-3 text-sm text-white hover:bg-[#131A22]'
            >
              Cart
            </Link>
            <Link
              to='/orders'
              className='block px-4 py-3 text-sm text-white hover:bg-[#131A22]'
            >
              Orders
            </Link>
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
