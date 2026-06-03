import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className='bg-[#131A22] text-white mt-auto'>
      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className='w-full bg-[#232F3E] hover:bg-[#37475A] py-3 text-sm text-center transition-colors'
      >
        Back to top
      </button>

      {/* Main footer */}
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          <div>
            <h3 className='text-lg font-bold mb-4'>
              <span className='text-white'>ecom</span>
              <span className='text-[#FF9900]'>store</span>
            </h3>
            <p className='text-sm text-gray-400'>
              Your one-stop shop for everything you need. Quality products at
              the best prices.
            </p>
          </div>

          <div>
            <h4 className='font-semibold mb-3'>Quick Links</h4>
            <ul className='space-y-2 text-sm text-gray-400'>
              <li>
                <Link to='/shop' className='hover:text-white transition-colors'>
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to='/shop?isFeatured=true'
                  className='hover:text-white transition-colors'
                >
                  Featured Products
                </Link>
              </li>
              <li>
                <Link to='/cart' className='hover:text-white transition-colors'>
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  to='/wishlist'
                  className='hover:text-white transition-colors'
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-semibold mb-3'>Account</h4>
            <ul className='space-y-2 text-sm text-gray-400'>
              <li>
                <Link
                  to='/profile'
                  className='hover:text-white transition-colors'
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to='/orders'
                  className='hover:text-white transition-colors'
                >
                  Orders
                </Link>
              </li>
              <li>
                <Link
                  to='/profile/addresses'
                  className='hover:text-white transition-colors'
                >
                  Addresses
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-semibold mb-3'>Contact</h4>
            <ul className='space-y-2 text-sm text-gray-400'>
              <li>support@ecomstore.com</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Store Street, NY 10001</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className='border-t border-gray-800'>
        <div className='max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500'>
          &copy; {new Date().getFullYear()} EcomStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
