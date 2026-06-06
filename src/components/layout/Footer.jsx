import React, { useState } from "react";
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
  FaChevronDown,
  FaChevronUp,
  FaThLarge,
  FaTags,
  FaStar,
  FaMedal,
  FaStore,
  FaHeadphones,
  FaBox,
  FaUndoAlt,
  FaTruck,
  FaEnvelope,
  FaUser,
  FaBriefcase,
  FaFileAlt,
  FaUsers,
  FaBullhorn,
  FaShieldAlt,
  FaFileContract,
  FaCreditCard,
  FaAward,
} from "react-icons/fa";

export default function Footer() {
  const [openSection, setOpenSection] = useState("");

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? "" : section);
  };

  const footerLinks = [
    {
      title: "Shop",
      links: [
        { name: "All Categories", path: "/shop", icon: <FaThLarge /> },
        { name: "Deals", path: "/deals", icon: <FaTags /> },
        {
          name: "New Arrivals",
          path: "/shop?sort=-createdAt",
          icon: <FaStar />,
        },
        {
          name: "Best Sellers",
          path: "/shop?isFeatured=true",
          icon: <FaMedal />,
        },
        { name: "Brands", path: "/brands", icon: <FaStore /> },
      ],
    },
    {
      title: "Customer Care",
      links: [
        { name: "Help Center", path: "/help", icon: <FaHeadphones /> },
        { name: "Track Order", path: "/orders", icon: <FaBox /> },
        { name: "Returns & Refunds", path: "/returns", icon: <FaUndoAlt /> },
        { name: "Shipping Info", path: "/shipping-info", icon: <FaTruck /> },
        { name: "Contact Us", path: "/contact", icon: <FaEnvelope /> },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", path: "/about", icon: <FaUser /> },
        { name: "Careers", path: "/careers", icon: <FaBriefcase /> },
        { name: "Blog", path: "/blog", icon: <FaFileAlt /> },
        { name: "Affiliate", path: "/affiliate", icon: <FaUsers /> },
        { name: "Press", path: "/press", icon: <FaBullhorn /> },
      ],
    },
    {
      title: "Policies",
      links: [
        { name: "Privacy Policy", path: "/privacy", icon: <FaShieldAlt /> },
        { name: "Terms of Service", path: "/terms", icon: <FaFileContract /> },
        { name: "Refund Policy", path: "/refund-policy", icon: <FaUndoAlt /> },
        {
          name: "Shipping Policy",
          path: "/shipping-policy",
          icon: <FaTruck />,
        },
        {
          name: "Payment Policy",
          path: "/payment-policy",
          icon: <FaCreditCard />,
        },
      ],
    },
  ];

  return (
    <footer className='bg-[#0A0F1C] text-white mt-auto font-sans w-full overflow-hidden'>
      <div className='max-w-[1400px] mx-auto px-6 py-12 lg:py-16'>
        {/* Top Section: Links Grid Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-8'>
          {/* Column 1: Brand Info & Socials */}
          <div className='lg:col-span-4 flex flex-col mb-6 lg:mb-0'>
            <Link
              to='/'
              className='text-2xl font-extrabold tracking-tighter text-white mb-6 inline-block'
            >
              <span className='font-bold text-white tracking-tight text-3xl'>
                ecom
              </span>
              <span className='font-bold text-[#FF6B00] tracking-tight text-3xl'>
                store
              </span>
            </Link>
            <p className='text-sm text-gray-400 mb-6 leading-relaxed max-w-sm'>
              Your one-stop destination for everything you need. Quality
              products, best prices, fast delivery.
            </p>
            <div className='flex gap-4 items-center'>
              {[
                FaFacebookF,
                FaInstagram,
                FaTwitter,
                FaPinterestP,
                FaYoutube,
              ].map((Icon, idx) => (
                <a
                  key={idx}
                  href='#'
                  className='w-10 h-10 rounded-full bg-[#111827] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#FF6B00] transition-all duration-300'
                >
                  <Icon className='w-4 h-4' />
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Link Columns with Mobile Accordion */}
          {footerLinks.map((section, idx) => (
            <div
              key={idx}
              className='lg:col-span-2 border-b border-gray-800/60 lg:border-none py-4 lg:py-0'
            >
              <button
                className='w-full flex justify-between items-center lg:cursor-default lg:pointer-events-none'
                onClick={() => toggleSection(section.title)}
              >
                <h4 className='font-bold text-white uppercase tracking-wider text-sm'>
                  {section.title}
                </h4>
                <span className='lg:hidden text-gray-400'>
                  {openSection === section.title ? (
                    <FaChevronUp className='w-3 h-3' />
                  ) : (
                    <FaChevronDown className='w-3 h-3' />
                  )}
                </span>
              </button>

              <ul
                className={`${
                  openSection === section.title ? "block" : "hidden"
                } lg:block space-y-4 mt-6 text-sm text-gray-400`}
              >
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      to={link.path}
                      className='flex items-center gap-3 hover:text-white transition-colors group'
                    >
                      <span className='text-gray-500 group-hover:text-[#FF6B00] transition-colors'>
                        {link.icon}
                      </span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Middle Section: Newsletter & Payments Card */}
        <div className='bg-[#111827] border border-gray-800/60 rounded-2xl p-6 lg:p-8 my-10 lg:my-14 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8'>
          {/* Left Side: Newsletter Form */}
          <div className='w-full lg:max-w-md xl:max-w-lg'>
            <h4 className='font-bold text-white mb-2 uppercase tracking-wider text-sm'>
              Newsletter
            </h4>
            <p className='text-sm text-gray-400 mb-4 leading-relaxed'>
              Subscribe to get special offers and updates.
            </p>
            <form className='flex flex-col sm:flex-row bg-[#0A0F1C] rounded-lg overflow-hidden border border-gray-700 focus-within:border-[#FF6B00] transition-colors duration-200'>
              <input
                type='email'
                placeholder='Enter your email address'
                className='w-full bg-transparent text-sm text-white px-4 py-3.5 outline-none placeholder-gray-500'
                required
              />
              <button
                type='submit'
                className='bg-[#FF6B00] text-white px-7 py-3.5 text-sm font-semibold hover:bg-[#E05D00] transition-colors whitespace-nowrap'
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Right Side: Payment Methods */}
          <div className='flex flex-col items-start lg:items-end w-full lg:w-auto'>
            <h4 className='font-bold text-white mb-4 uppercase tracking-wider text-sm lg:text-right w-full'>
              We Accept
            </h4>
            <div className='flex flex-wrap gap-3'>
              {[
                FaCcVisa,
                FaCcMastercard,
                FaCcPaypal,
                FaApplePay,
                FaGooglePay,
              ].map((Icon, idx) => (
                <div
                  key={idx}
                  className='bg-white rounded-md px-3 py-2 h-10 flex items-center justify-center shadow-sm cursor-pointer'
                >
                  <Icon
                    className={`w-10 h-6 ${
                      idx === 0
                        ? "text-[#1434CB]"
                        : idx === 1
                          ? "text-[#EB001B]"
                          : idx === 2
                            ? "text-[#00457C]"
                            : "text-black"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Trust Badges & Copyright */}
        <div className='pt-6 border-t border-gray-800/60 flex flex-col lg:flex-row justify-between items-center gap-8 text-sm text-gray-400'>
          {/* Trust Badge Left */}
          <div className='flex items-center gap-3 w-full lg:w-auto justify-center lg:justify-start'>
            <div className='w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]'>
              <FaShieldAlt className='w-5 h-5' />
            </div>
            <div>
              <p className='font-bold text-white text-xs lg:text-sm'>
                100% Secure Shopping
              </p>
              <p className='text-xs'>Your data is safe with us.</p>
            </div>
          </div>

          {/* Copyright & Links */}
          <div className='text-center order-last lg:order-none'>
            <p className='mb-2'>
              &copy; {new Date().getFullYear()} SHOP.CO. All rights reserved.
            </p>
            <div className='flex flex-wrap justify-center gap-3 lg:gap-4 text-xs'>
              <Link
                to='/sitemap'
                className='hover:text-white transition-colors'
              >
                Sitemap
              </Link>
              <span className='text-gray-700'>|</span>
              <Link
                to='/accessibility'
                className='hover:text-white transition-colors'
              >
                Accessibility
              </Link>
              <span className='text-gray-700'>|</span>
              <Link
                to='/store-location'
                className='hover:text-white transition-colors'
              >
                Store Location
              </Link>
            </div>
          </div>

          {/* Trust Badges Right */}
          <div className='flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto justify-center lg:justify-end hidden md:flex'>
            <div className='flex items-center gap-3'>
              <FaTruck className='text-gray-500 w-6 h-6' />
              <div className='text-left'>
                <p className='font-bold text-white text-xs lg:text-sm'>
                  Fast Delivery
                </p>
                <p className='text-xs'>Across the country</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <FaAward className='text-gray-500 w-6 h-6' />
              <div className='text-left'>
                <p className='font-bold text-white text-xs lg:text-sm'>
                  Best Quality
                </p>
                <p className='text-xs'>Premium products</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
