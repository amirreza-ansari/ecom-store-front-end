import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  HiShoppingCart,
  HiHeart,
  HiUser,
  HiBars3,
  HiXMark,
} from "react-icons/hi2";
import SearchBar from "../ui/SearchBar";
import { loginUser, logoutUser } from "../../features/auth/authSlice";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  return (
    <header className='bg-[#131A22] sticky top-0 z-40'>
      {/* Top bar */}
      <div className='flex items-center px-4 py-2 gap-4 max-w-7xl mx-auto'>
        {/* Logo */}
        <Link to='/' className='flex items-center gap-1 shrink-0'>
          <span className='text-2xl font-bold text-white tracking-tight'>
            ecom
          </span>
          <span className='text-2xl font-bold text-[#FF9900] tracking-tight'>
            store
          </span>
        </Link>

        {/* Search */}
        <SearchBar />

        {/* Right icons */}
        <div className='flex items-center gap-1 shrink-0'>
          {/* Wishlist */}
          <Link
            to='/wishlist'
            className='relative p-2 text-white hover:text-[#FF9900] transition-colors'
          >
            <HiHeart className='w-6 h-6' />
            {wishlistItems.length > 0 && (
              <span className='absolute -top-0.5 -right-0.5 bg-[#FF9900] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'>
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to='/cart'
            className='relative p-2 text-white hover:text-[#FF9900] transition-colors'
          >
            <HiShoppingCart className='w-6 h-6' />
            {totalItems > 0 && (
              <span className='absolute -top-0.5 -right-0.5 bg-[#FF9900] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'>
                {totalItems}
              </span>
            )}
          </Link>

          {/* User menu */}
          <div className='relative group'>
            <button className='p-2 text-white hover:text-[#FF9900] transition-colors'>
              <HiUser className='w-6 h-6' />
            </button>
            <div className='absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-[#D5D9D9] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200'>
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
                    className='block w-full text-left px-4 py-2 text-sm text-[#B12704] hover:bg-[#F7FAFA]'
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button className='block w-full text-left px-4 py-2 text-sm text-[#0F1111] hover:bg-[#F7FAFA] rounded-t-lg'>
                    Sign In
                  </button>
                  <button className='block w-full text-left px-4 py-2 text-sm text-[#0F1111] hover:bg-[#F7FAFA] rounded-b-lg'>
                    Register
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
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

      {/* Bottom nav */}
      <nav className='bg-[#232F3E] hidden md:block'>
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
            to='/orders'
            className='px-3 py-2 text-sm text-white hover:text-[#FF9900] transition-colors'
          >
            Orders
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className='md:hidden bg-[#232F3E] border-t border-gray-700'>
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
      )}
    </header>
  );
}
