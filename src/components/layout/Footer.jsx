import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaPinterestP,
  FaYoutube,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaApplePay,
  FaGooglePay,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className='bg-[#0A0F1C] text-white mt-auto font-sans w-full overflow-hidden'>
      <div className='max-w-[1400px] mx-auto px-6 py-16'>
        {/* Top Section: Links Grid Layout (Balanced 12-Column Grid) */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-8'>
          {/* Column 1: Brand Info & Socials */}
          <div className='lg:col-span-4 flex flex-col'>
            <Link
              to='/'
              className='text-2xl font-extrabold tracking-tighter text-white mb-6 inline-block'
            >
              <span className='font-bold text-white tracking-tight transition-all duration-300 text-3xl'>
                ecom
              </span>
              <span className='font-bold text-[#FF9900] tracking-tight transition-all duration-300 text-3xl'>
                store
              </span>
            </Link>
            <p className='text-sm text-gray-400 mb-6 leading-relaxed max-w-sm'>
              Your one-stop destination for everything you need. Quality
              products, best prices, fast delivery.
            </p>
            <div className='flex gap-4 items-center'>
              <a
                href='#'
                className='text-gray-400 hover:text-[#FF4500] transition-colors'
              >
                <FaFacebookF className='w-5 h-5' />
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-[#FF4500] transition-colors'
              >
                <FaInstagram className='w-5 h-5' />
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-[#FF4500] transition-colors'
              >
                <FaTwitter className='w-5 h-5' />
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-[#FF4500] transition-colors'
              >
                <FaPinterestP className='w-5 h-5' />
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-[#FF4500] transition-colors'
              >
                <FaYoutube className='w-5 h-5' />
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div className='lg:col-span-2'>
            <h4 className='font-bold text-white mb-6 uppercase tracking-wider text-sm'>
              Shop
            </h4>
            <ul className='space-y-4 text-sm text-gray-400'>
              <li>
                <Link to='/shop' className='hover:text-white transition-colors'>
                  All Categories
                </Link>
              </li>
              <li>
                <Link
                  to='/deals'
                  className='hover:text-white transition-colors'
                >
                  Deals
                </Link>
              </li>
              <li>
                <Link
                  to='/shop?sort=-createdAt'
                  className='hover:text-white transition-colors'
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  Align
                  to='/shop?isFeatured=true'
                  className='hover:text-white transition-colors'
                >
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link
                  to='/brands'
                  className='hover:text-white transition-colors'
                >
                  Brands
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className='lg:col-span-2'>
            <h4 className='font-bold text-white mb-6 uppercase tracking-wider text-sm'>
              Customer Care
            </h4>
            <ul className='space-y-4 text-sm text-gray-400'>
              <li>
                <Link to='/help' className='hover:text-white transition-colors'>
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to='/orders'
                  className='hover:text-white transition-colors'
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  to='/returns'
                  className='hover:text-white transition-colors'
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  to='/shipping-info'
                  className='hover:text-white transition-colors'
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  to='/contact'
                  className='hover:text-white transition-colors'
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className='lg:col-span-2'>
            <h4 className='font-bold text-white mb-6 uppercase tracking-wider text-sm'>
              Company
            </h4>
            <ul className='space-y-4 text-sm text-gray-400'>
              <li>
                <Link
                  to='/about'
                  className='hover:text-white transition-colors'
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to='/careers'
                  className='hover:text-white transition-colors'
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link to='/blog' className='hover:text-white transition-colors'>
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to='/affiliate'
                  className='hover:text-white transition-colors'
                >
                  Affiliate
                </Link>
              </li>
              <li>
                <Link
                  to='/press'
                  className='hover:text-white transition-colors'
                >
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Policies */}
          <div className='lg:col-span-2'>
            <h4 className='font-bold text-white mb-6 uppercase tracking-wider text-sm'>
              Policies
            </h4>
            <ul className='space-y-4 text-sm text-gray-400'>
              <li>
                <Link
                  to='/privacy'
                  className='hover:text-white transition-colors'
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to='/terms'
                  className='hover:text-white transition-colors'
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to='/refund-policy'
                  className='hover:text-white transition-colors'
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  to='/shipping-policy'
                  className='hover:text-white transition-colors'
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  to='/payment-policy'
                  className='hover:text-white transition-colors'
                >
                  Payment Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Decorative Divider Line */}
        <div className='border-t border-gray-800/60 my-12' />

        {/* Bottom Section: Newsletter & Payments Side-by-Side */}
        <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8'>
          {/* Left Side: Newsletter Form */}
          <div className='w-full lg:max-w-md xl:max-w-lg'>
            <h4 className='font-bold text-white mb-3 uppercase tracking-wider text-sm'>
              Newsletter
            </h4>
            <p className='text-sm text-gray-400 mb-4 leading-relaxed'>
              Subscribe to get special offers and updates.
            </p>
            <form className='flex flex-col sm:flex-row bg-[#111827] rounded-lg overflow-hidden border border-gray-800 focus-within:border-[#FF4500] focus-within:ring-1 focus-within:ring-[#FF4500] transition-all duration-200'>
              <input
                type='email'
                placeholder='Enter your email'
                className='w-full bg-transparent text-sm text-white px-4 py-3.5 outline-none placeholder-gray-500'
                required
              />
              <button
                type='submit'
                className='bg-[#FF4500] text-white px-7 py-3.5 text-sm font-semibold hover:bg-[#E03E00] active:scale-[0.99] transition-all whitespace-nowrap'
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Right Side: Payment Methods */}
          <div className='flex flex-col items-start lg:items-end w-full lg:w-auto'>
            <h4 className='font-bold text-gray-400 mb-4 uppercase tracking-wider text-xs lg:text-right w-full'>
              We Accept
            </h4>
            <div className='flex flex-wrap gap-2.5'>
              <div className='bg-white rounded-md px-3 py-1.5 h-9 flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity cursor-pointer'>
                <FaCcVisa className='w-9 h-6 text-[#1434CB]' />
              </div>
              <div className='bg-white rounded-md px-3 py-1.5 h-9 flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity cursor-pointer'>
                <FaCcMastercard className='w-9 h-6 text-[#EB001B]' />
              </div>
              <div className='bg-white rounded-md px-3 py-1.5 h-9 flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity cursor-pointer'>
                <FaCcPaypal className='w-9 h-6 text-[#00457C]' />
              </div>
              <div className='bg-white rounded-md px-3 py-1.5 h-9 flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity cursor-pointer'>
                <FaApplePay className='w-9 h-6 text-black' />
              </div>
              <div className='bg-white rounded-md px-3 py-1.5 h-9 flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity cursor-pointer'>
                <FaGooglePay className='w-9 h-6 text-black' />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className='border-t border-gray-800'>
        <div className='max-w-[1400px] mx-auto px-6 py-6 text-center text-sm text-gray-500'>
          &copy; {new Date().getFullYear()} SHOP.CO. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
