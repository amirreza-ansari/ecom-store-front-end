import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  HiOutlineShoppingCart,
  HiOutlineHeart,
  HiOutlineUser,
  HiBars3,
  HiXMark,
  HiChevronDown,
  HiChevronRight,
} from "react-icons/hi2";
import SearchBar from "../ui/SearchBar";
import { logoutUser } from "../../features/auth/authSlice";
import LoginModal from "../../features/auth/LoginModal";
import RegisterModal from "../../features/auth/RegisterModal";
import ForgotPasswordModal from "../../features/auth/ForgotPasswordModal";
import { categoryApi } from "../../features/products/categoryApi";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  // Mega Menu & Category State
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  // Mobile Category Accordion State
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);

  const megaMenuRef = useRef(null);
  const closeTimerRef = useRef(null);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch Categories
  useEffect(() => {
    categoryApi
      .getAll()
      .then((res) => {
        const fetchedCategories = res.data.data.categories;
        setCategories(fetchedCategories);
        if (fetchedCategories.length > 0) {
          setActiveCategoryId(fetchedCategories[0]._id);
        }
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
    setExpandedMobileCategory(null); // Reset mobile accordion
  }, [location.pathname, location.search]);

  // Close mega menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target)) {
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  const activeCategory =
    categories.find((c) => c._id === activeCategoryId) || categories[0];

  // Delay closing mega menu for better UX
  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setMegaMenuOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => setMegaMenuOpen(false), 200);
  };

  // Popular brands (can be replaced with API data)
  const popularBrands = [
    { name: "Apple", slug: "apple" },
    { name: "Samsung", slug: "samsung" },
    { name: "Sony", slug: "sony" },
    { name: "OnePlus", slug: "oneplus" },
    { name: "Google", slug: "google" },
  ];

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
              className='text-3xl font-extrabold tracking-tighter text-black'
            >
              <span className='font-bold text-black'>ecom</span>
              <span className='font-bold text-[#FF9900]'>store</span>
            </Link>

            {/* Desktop Mega Menu */}
            <div
              ref={megaMenuRef}
              className='hidden lg:flex items-center gap-2 cursor-pointer text-gray-700 hover:text-black transition-colors relative py-4'
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <HiBars3 className='w-5 h-5' />
              <span className='font-medium text-sm'>All Categories</span>
              <HiChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${megaMenuOpen ? "rotate-180" : ""}`}
              />

              {/* Mega Menu Overlay */}
              <div
                className={`absolute top-full -left-20 w-[950px] bg-white border border-gray-100 shadow-2xl rounded-xl transition-all duration-200 z-50 flex overflow-hidden ${
                  megaMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
              >
                {/* Left Sidebar - Main Categories */}
                <div className='w-[260px] bg-white py-4 border-r border-gray-100 flex flex-col shrink-0'>
                  {categories.map((cat) => (
                    <div
                      key={cat._id}
                      onMouseEnter={() => setActiveCategoryId(cat._id)}
                      onClick={() => {
                        navigate(`/shop?category=${cat._id}`);
                        setMegaMenuOpen(false);
                      }}
                      className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-colors ${
                        activeCategoryId === cat._id
                          ? "text-[#FF4500] bg-orange-50/50 border-r-2 border-[#FF4500]"
                          : "text-gray-700 hover:text-[#FF4500] hover:bg-gray-50"
                      }`}
                    >
                      <span className='text-sm font-semibold'>{cat.name}</span>
                      <HiChevronRight
                        className={`w-4 h-4 ${activeCategoryId === cat._id ? "text-[#FF4500]" : "text-gray-400"}`}
                      />
                    </div>
                  ))}

                  {/* Quick Links */}
                  <div className='mt-auto pt-4 border-t border-gray-100 px-6 space-y-3'>
                    <Link
                      to='/shop?isFeatured=true'
                      onClick={() => setMegaMenuOpen(false)}
                      className='block text-sm font-medium text-gray-600 hover:text-[#FF4500]'
                    >
                      🔥 Featured Deals
                    </Link>
                    <Link
                      to='/shop?sort=-createdAt'
                      onClick={() => setMegaMenuOpen(false)}
                      className='block text-sm font-medium text-gray-600 hover:text-[#FF4500]'
                    >
                      🆕 New Arrivals
                    </Link>
                  </div>
                </div>

                {/* Right Content - Subcategories & Brands */}
                <div className='flex-1 p-8 bg-[#FAFAFA] flex flex-col'>
                  <div className='flex gap-8 flex-1'>
                    {/* Subcategory Columns */}
                    <div className='grid grid-cols-3 gap-6 flex-1'>
                      {activeCategory?.subcategories?.length > 0 ? (
                        activeCategory.subcategories.map((sub) => (
                          <div key={sub._id}>
                            <Link
                              to={`/shop?category=${sub._id}`}
                              onClick={() => setMegaMenuOpen(false)}
                              className='block'
                            >
                              <h4 className='text-[#FF4500] font-bold text-sm mb-4 pb-2 border-b border-gray-200 hover:opacity-80 transition-opacity'>
                                {sub.name}
                              </h4>
                            </Link>
                            <ul className='space-y-3'>
                              {sub.subcategories?.length > 0 ? (
                                sub.subcategories.map((item) => (
                                  <li key={item._id}>
                                    <Link
                                      to={`/shop?category=${item._id}`}
                                      onClick={() => setMegaMenuOpen(false)}
                                      className='text-sm font-medium text-gray-600 hover:text-[#FF4500] transition-colors'
                                    >
                                      {item.name}
                                    </Link>
                                  </li>
                                ))
                              ) : (
                                <li>
                                  <Link
                                    to={`/shop?category=${sub._id}`}
                                    onClick={() => setMegaMenuOpen(false)}
                                    className='text-sm font-medium text-gray-600 hover:text-[#FF4500] transition-colors'
                                  >
                                    View all {sub.name}
                                  </Link>
                                </li>
                              )}
                            </ul>
                          </div>
                        ))
                      ) : (
                        <div className='col-span-3 text-center py-8'>
                          <Link
                            to={`/shop?category=${activeCategory?._id}`}
                            onClick={() => setMegaMenuOpen(false)}
                            className='text-sm font-medium text-[#FF4500] hover:underline'
                          >
                            Browse all {activeCategory?.name || "products"} →
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Brands Sidebar */}
                    <div className='w-[140px] border-l border-gray-200 pl-6 shrink-0'>
                      <h4 className='text-[#FF4500] font-bold text-sm mb-4 pb-2 border-b border-gray-200'>
                        Top Brands
                      </h4>
                      <ul className='space-y-4'>
                        {popularBrands.map((brand) => (
                          <li key={brand.name}>
                            <Link
                              to={`/shop?brand=${brand.slug}`}
                              onClick={() => setMegaMenuOpen(false)}
                              className='flex items-center gap-2 group'
                            >
                              <div className='w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-800 group-hover:bg-[#FF4500] group-hover:text-white group-hover:border-[#FF4500] transition-colors'>
                                {brand.name[0]}
                              </div>
                              <span className='text-sm font-medium text-gray-600 group-hover:text-[#FF4500] transition-colors'>
                                {brand.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Promotional Banner */}
                  <Link
                    to={`/shop?category=${activeCategory?._id}`}
                    onClick={() => setMegaMenuOpen(false)}
                    className='mt-8 bg-gradient-to-r from-[#FFF4ED] to-[#FFE8D6] rounded-xl p-6 flex items-center justify-between border border-orange-100 shadow-sm hover:shadow-md transition-shadow group'
                  >
                    <div>
                      <h3 className='text-xl font-bold text-gray-900'>
                        Latest {activeCategory?.name || "Arrivals"}
                      </h3>
                      <p className='text-sm text-gray-600 mt-1 mb-4 font-medium'>
                        Up to 40% off on top products
                      </p>
                      <span className='inline-block bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold group-hover:bg-[#FF4500] transition-colors'>
                        Shop Now →
                      </span>
                    </div>
                    <div className='flex gap-3'>
                      <div className='w-20 h-24 bg-white/80 rounded-lg shadow-sm flex items-center justify-center text-3xl'>
                        🛍️
                      </div>
                      <div className='w-20 h-24 bg-white/80 rounded-lg shadow-sm flex items-center justify-center text-3xl'>
                        🎁
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className='hidden md:block flex-1 max-w-2xl bg-[#F0F0F0] rounded-full'>
            <SearchBar />
          </div>

          {/* Right: Actions */}
          <div className='flex items-center gap-4 lg:gap-6 shrink-0 text-black'>
            {/* Account */}
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

        {/* --- MOBILE MENU --- */}
        <div
          className={`lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl transition-all duration-300 origin-top overflow-y-auto max-h-[calc(100vh-120px)] ${
            mobileMenuOpen
              ? "opacity-100 scale-y-100 visible"
              : "opacity-0 scale-y-95 invisible"
          }`}
        >
          <div className='px-4 py-5 flex flex-col gap-6'>
            {/* Mobile Search */}
            <div className='md:hidden bg-[#F0F0F0] rounded-full'>
              <SearchBar />
            </div>

            <nav className='flex flex-col'>
              <Link
                to='/'
                className='py-3 text-base font-bold text-gray-900 border-b border-gray-100'
              >
                Home
              </Link>

              {/* Dynamic Categories Accordion */}
              <div className='py-4 border-b border-gray-100'>
                <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-3'>
                  Shop by Category
                </p>
                <div className='flex flex-col space-y-1'>
                  {categories.map((cat) => (
                    <div key={cat._id} className='flex flex-col'>
                      <div className='flex items-center justify-between'>
                        <Link
                          to={`/shop?category=${cat._id}`}
                          className='flex-1 py-3 text-base font-semibold text-gray-800 hover:text-[#FF4500]'
                        >
                          {cat.name}
                        </Link>
                        {cat.subcategories?.length > 0 && (
                          <button
                            onClick={() =>
                              setExpandedMobileCategory(
                                expandedMobileCategory === cat._id
                                  ? null
                                  : cat._id,
                              )
                            }
                            className='p-3 -mr-3 flex items-center justify-center'
                          >
                            <HiChevronDown
                              className={`w-5 h-5 transition-transform duration-200 ${
                                expandedMobileCategory === cat._id
                                  ? "rotate-180 text-[#FF4500]"
                                  : "text-gray-400"
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Subcategories Dropdown */}
                      {cat.subcategories?.length > 0 &&
                        expandedMobileCategory === cat._id && (
                          <div className='bg-gray-50 rounded-lg p-4 mt-1 mb-2 space-y-4 shadow-inner'>
                            {cat.subcategories.map((sub) => (
                              <div key={sub._id} className='flex flex-col'>
                                <Link
                                  to={`/shop?category=${sub._id}`}
                                  className='text-sm font-bold text-[#FF4500] mb-2'
                                >
                                  {sub.name}
                                </Link>
                                {sub.subcategories?.length > 0 && (
                                  <div className='flex flex-col pl-3 border-l-2 border-orange-100 space-y-2.5'>
                                    {sub.subcategories.map((item) => (
                                      <Link
                                        key={item._id}
                                        to={`/shop?category=${item._id}`}
                                        className='text-sm font-medium text-gray-600 hover:text-black'
                                      >
                                        {item.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links Footer */}
              <div className='pt-4 space-y-1'>
                <Link
                  to='/shop?isFeatured=true'
                  className='block py-3 text-base font-semibold text-gray-800'
                >
                  🔥 Featured Deals
                </Link>
                <Link
                  to='/orders'
                  className='block py-3 text-base font-semibold text-gray-800'
                >
                  📦 My Orders
                </Link>
              </div>
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
