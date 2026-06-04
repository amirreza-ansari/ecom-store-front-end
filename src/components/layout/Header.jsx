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

  // Detect scroll for shrink and glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#131A22]/85 backdrop-blur-lg shadow-2xl border-b border-white/10"
            : "bg-[#131A22] shadow-md"
        }`}
      >
        {/* Main Header */}
        <div
          className={`flex items-center justify-between px-4 gap-4 max-w-7xl mx-auto transition-all duration-300 relative z-50 ${
            scrolled ? "py-2" : "py-3"
          }`}
        >
          {/* Left Section: Logo & Desktop Nav */}
          <div className='flex items-center gap-8'>
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

            {/* Desktop Navigation Links - hidden on smaller screens to prevent crowding */}
            <nav className='hidden lg:flex items-center gap-6'>
              <Link
                to='/'
                className='text-sm font-medium text-white/90 hover:text-[#FF9900] transition-colors'
              >
                Home
              </Link>
              <Link
                to='/shop'
                className='text-sm font-medium text-white/90 hover:text-[#FF9900] transition-colors'
              >
                Shop
              </Link>
              <Link
                to='/shop?isFeatured=true'
                className='text-sm font-medium text-white/90 hover:text-[#FF9900] transition-colors'
              >
                Featured
              </Link>
              <Link
                to='/shop?sort=-createdAt'
                className='text-sm font-medium text-white/90 hover:text-[#FF9900] transition-colors'
              >
                New Arrivals
              </Link>
              <Link
                to='/orders'
                className='text-sm font-medium text-white/90 hover:text-[#FF9900] transition-colors'
              >
                Orders
              </Link>
            </nav>
          </div>

          {/* Search - Smaller width to fit main nav */}
          <div
            className={`hidden md:block flex-1 max-w-sm transition-all duration-300 ${
              scrolled ? "opacity-90" : "opacity-100"
            }`}
          >
            <SearchBar />
          </div>

          {/* Right Icons */}
          <div
            className={`flex items-center gap-2 shrink-0 transition-all duration-300 ${
              scrolled ? "scale-95" : "scale-100"
            }`}
          >
            {/* Wishlist */}
            <Link
              to='/wishlist'
              className='relative p-2 text-white hover:text-[#FF9900] transition-colors group'
            >
              <HiHeart className='w-6 h-6 group-hover:scale-110 transition-transform' />
              {wishlistItems.length > 0 && (
                <span className='absolute top-0 right-0 bg-[#FF9900] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse shadow-lg'>
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
                <span className='absolute top-0 right-0 bg-[#FF9900] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-lg'>
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className='relative group hidden sm:block'>
              <button
                type='button'
                className='p-2 text-white hover:text-[#FF9900] transition-colors'
              >
                <HiUser className='w-6 h-6 group-hover:scale-110 transition-transform' />
              </button>
              <div className='absolute right-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden'>
                {isAuthenticated ? (
                  <>
                    <div className='px-4 py-3 border-b border-gray-100 bg-gray-50/50'>
                      <p className='text-sm font-semibold text-gray-900 truncate'>
                        {user?.name}
                      </p>
                      <p className='text-xs text-gray-500 truncate'>
                        {user?.email}
                      </p>
                    </div>
                    <div className='py-1'>
                      <Link
                        to='/profile'
                        className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF9900] transition-colors'
                      >
                        Profile
                      </Link>
                      <Link
                        to='/orders'
                        className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF9900] transition-colors'
                      >
                        Orders
                      </Link>
                      {user?.role === "admin" && (
                        <Link
                          to='/admin'
                          className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF9900] transition-colors'
                        >
                          Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className='border-t border-gray-100 py-1'>
                      <button
                        type='button'
                        onClick={handleLogout}
                        className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors'
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className='py-1'>
                    <button
                      type='button'
                      onClick={() => setLoginOpen(true)}
                      className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF9900] transition-colors'
                    >
                      Sign In
                    </button>
                    <button
                      type='button'
                      onClick={() => setRegisterOpen(true)}
                      className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF9900] transition-colors'
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              type='button'
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className='lg:hidden p-2 text-white hover:text-[#FF9900] transition-colors relative z-50'
            >
              {mobileMenuOpen ? (
                <HiXMark className='w-7 h-7' />
              ) : (
                <HiBars3 className='w-7 h-7' />
              )}
            </button>
          </div>
        </div>

        {/* Polished Mobile Dropdown Menu (Glassmorphic) */}
        <div
          className={`lg:hidden absolute top-full left-0 w-full transition-all duration-300 ease-in-out origin-top border-b border-white/10 ${
            mobileMenuOpen
              ? "opacity-100 scale-y-100 visible pointer-events-auto bg-[#131A22]/95 backdrop-blur-xl shadow-2xl"
              : "opacity-0 scale-y-95 invisible pointer-events-none"
          }`}
        >
          <div className='px-4 pt-2 pb-6 flex flex-col gap-1'>
            {/* Mobile Search Bar inside menu */}
            <div className='md:hidden mb-4 mt-2'>
              <SearchBar />
            </div>

            {/* Links */}
            {[
              { name: "Home", path: "/" },
              { name: "Shop All", path: "/shop" },
              { name: "Featured", path: "/shop?isFeatured=true" },
              { name: "New Arrivals", path: "/shop?sort=-createdAt" },
              { name: "My Orders", path: "/orders" },
            ].map((link) => {
              const isActive =
                location.pathname === link.path ||
                location.pathname + location.search === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-white/10 text-[#FF9900]"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Mobile User Auth Section */}
            <div className='mt-4 pt-4 border-t border-white/10 px-4'>
              {isAuthenticated ? (
                <div className='flex flex-col gap-3'>
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='w-10 h-10 rounded-full bg-[#FF9900]/20 flex items-center justify-center text-[#FF9900] font-bold'>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-white'>
                        {user?.name}
                      </p>
                      <p className='text-xs text-white/60'>{user?.email}</p>
                    </div>
                  </div>
                  <Link to='/profile' className='text-sm text-white/80 py-2'>
                    Profile Settings
                  </Link>
                  {user?.role === "admin" && (
                    <Link to='/admin' className='text-sm text-[#FF9900] py-2'>
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className='text-left text-sm text-red-400 py-2'
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className='flex gap-3'>
                  <button
                    onClick={() => setLoginOpen(true)}
                    className='flex-1 py-2.5 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors'
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setRegisterOpen(true)}
                    className='flex-1 py-2.5 bg-[#FF9900] text-white rounded-lg text-sm font-medium hover:bg-[#FF8800] transition-colors'
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
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
