import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchProducts } from "../features/products/productSlice";
import { categoryApi } from "../features/products/categoryApi";
import ProductCard from "../features/products/ProductCard";
import ProductCardSkeleton from "../features/products/ProductCardSkeleton";
import Button from "../components/ui/Button";
import StarRating from "../components/ui/StarRating";
import FadeIn from "../components/ui/FadeIn";
import { StaggerContainer, StaggerItem } from "../components/ui/StaggerList";
import {
  HiArrowRight,
  HiArrowLeft,
  HiStar,
  HiTruck,
  HiShieldCheck,
  HiArrowPath,
  HiPhone,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

// Hero slides with image placeholders for the carousel
const heroSlides = [
  {
    tag: "NEW COLLECTION",
    title: "Everything You Need.\nDelivered Fast.",
    subtitle:
      "Shop electronics, fashion, home, beauty and more from top brands at the best prices.",
    ctaPrimary: "Shop Now",
    ctaSecondary: "Browse Categories",
    linkPrimary: "/shop?sort=-createdAt",
    linkSecondary: "/categories",
    bgClass: "bg-[#0A0D14]",
    // Replace this URL with your actual hero image
    image:
      "https://placehold.co/800x600/1f2937/ffffff?text=Main+Hero+Image+(Replace+Me)",
  },
  {
    tag: "FLASH SALE",
    title: "Unbeatable Deals.\nPremium Tech.",
    subtitle:
      "Upgrade your setup with up to 50% off select high-performance devices.",
    ctaPrimary: "Grab Deals",
    ctaSecondary: "View Featured",
    linkPrimary: "/shop?isFeatured=true",
    linkSecondary: "/shop",
    bgClass: "bg-[#111827]",
    // Replace this URL with your actual hero image
    image:
      "https://placehold.co/800x600/374151/ffffff?text=Tech+Hero+Image+(Replace+Me)",
  },
];

const testimonials = [
  {
    name: "Sarah J.",
    role: "Verified Buyer",
    rating: 5,
    text: "Amazing variety, great prices and super fast delivery. Highly recommended!",
  },
  {
    name: "Michael T.",
    role: "Verified Buyer",
    rating: 5,
    text: "Love shopping here! The quality is always top-notch.",
  },
  {
    name: "Emily R.",
    role: "Verified Buyer",
    rating: 5,
    text: "Best customer service I've experienced in a long time.",
  },
  {
    name: "David L.",
    role: "Verified Buyer",
    rating: 5,
    text: "My go-to store for everything. Always reliable!",
  },
];

function useCountUp(end, duration = 2000, startCounting = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startCounting) return;
    let startTime;
    let frame;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [end, duration, startCounting]);
  return count;
}

function StatCounter({ value, label, suffix = "", prefix = "" }) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  const count = useCountUp(value, 2000, inView);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold: 0.3 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className='text-center p-4 flex flex-col items-center justify-center'
    >
      <div className='flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-3 text-[#FF5A00]'>
        <HiOutlineCheckCircle className='w-6 h-6' />
      </div>
      <p className='text-2xl md:text-3xl font-bold text-white tracking-tight'>
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className='text-sm font-medium text-white/70 mt-1'>{label}</p>
    </div>
  );
}

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { products, isLoading } = useAppSelector((state) => state.products);
  const [categories, setCategories] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("TRENDING NOW");

  useEffect(() => {
    dispatch(fetchProducts({ limit: 16 }));
    categoryApi
      .getAll()
      .then((res) => setCategories(res.data.data.categories || []));
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentSlide((p) => (p + 1) % heroSlides.length),
      6000,
    );
    return () => clearInterval(interval);
  }, []);

  const slide = heroSlides[currentSlide];
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 5);
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  const bestSellers = [...products]
    .sort((a, b) => (b.ratingsQuantity || 0) - (a.ratingsQuantity || 0))
    .slice(0, 5);

  const getTabProducts = () => {
    if (activeTab === "TRENDING NOW") return featuredProducts;
    if (activeTab === "BEST SELLERS") return bestSellers;
    return newArrivals;
  };

  return (
    <div className='overflow-hidden bg-white min-h-screen font-sans antialiased text-[#0F1111]'>
      {/* ========== HERO SECTION ========== */}
      <section
        className={`relative ${slide.bgClass} min-h-[500px] md:min-h-[560px] flex items-center transition-colors duration-700 m-4 rounded-3xl overflow-hidden`}
      >
        <div className='max-w-7xl mx-auto px-6 md:px-12 py-12 w-full relative z-10'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
            {/* Text Content */}
            <div className='text-white space-y-6 text-center md:text-left'>
              <span className='inline-block text-[#FF5A00] text-xs font-bold tracking-widest uppercase'>
                {slide.tag}
              </span>
              <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight whitespace-pre-line'>
                {slide.title}
              </h1>
              <p className='text-sm sm:text-base text-white/70 max-w-md mx-auto md:mx-0 leading-relaxed'>
                {slide.subtitle}
              </p>

              <div className='flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4'>
                <Link to={slide.linkPrimary} className='w-full sm:w-auto'>
                  <Button
                    size='lg'
                    className='w-full sm:w-auto !bg-[#FF5A00] !text-white hover:!bg-[#E04F00] font-semibold rounded-full px-8 transition-all'
                  >
                    {slide.ctaPrimary}
                  </Button>
                </Link>
                <Link to={slide.linkSecondary} className='w-full sm:w-auto'>
                  <Button
                    size='lg'
                    variant='outline'
                    className='w-full sm:w-auto !border-white/30 !text-white hover:!bg-white/10 font-semibold rounded-full px-8 transition-all'
                  >
                    {slide.ctaSecondary}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Image Content (Placeholder) */}
            <div className='flex justify-center items-center relative'>
              <img
                src={slide.image}
                alt='Hero Collection'
                className='w-full max-w-lg h-auto object-contain drop-shadow-2xl animate-fade-in-up'
              />
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2'>
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`transition-all duration-300 rounded-full h-2 ${
                i === currentSlide
                  ? "w-8 bg-[#FF5A00]"
                  : "w-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ========== TRUST BAR ========== */}
      <section className='border-b border-gray-100 py-6'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='flex flex-wrap justify-between items-center gap-6 text-sm'>
            {[
              { icon: HiShieldCheck, title: "50K+", desc: "Products" },
              {
                icon: HiTruck,
                title: "Free Shipping",
                desc: "On orders over $50",
              },
              {
                icon: HiArrowPath,
                title: "Secure Payment",
                desc: "100% secure checkout",
              },
              {
                icon: HiPhone,
                title: "24/7 Support",
                desc: "We're here to help",
              },
            ].map((item, idx) => (
              <div key={idx} className='flex items-center gap-3'>
                <item.icon className='w-6 h-6 text-gray-400' />
                <div>
                  <h3 className='font-bold text-[#0F1111] leading-tight'>
                    {item.title}
                  </h3>
                  <p className='text-xs text-gray-500'>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className='max-w-7xl mx-auto px-4 py-12 space-y-20'>
        {/* ========== SHOP BY CATEGORY ========== */}
        <FadeIn>
          <section>
            <div className='flex items-center justify-between mb-8'>
              <h2 className='text-xl md:text-2xl font-bold tracking-tight uppercase'>
                Shop By Category
              </h2>
              <Link
                to='/categories'
                className='text-sm font-semibold text-gray-500 hover:text-[#FF5A00] flex items-center gap-1'
              >
                View all categories <HiArrowRight className='w-4 h-4' />
              </Link>
            </div>

            <StaggerContainer>
              <div className='flex overflow-x-auto gap-4 md:gap-6 pb-4 scrollbar-none snap-x md:grid md:grid-cols-4 lg:grid-cols-8 md:overflow-visible md:pb-0'>
                {categories.slice(0, 8).map((cat, index) => {
                  return (
                    <StaggerItem
                      key={cat._id}
                      className='w-24 shrink-0 snap-start md:w-auto group cursor-pointer'
                    >
                      <Link
                        to={`/shop?category=${cat._id}`}
                        className='flex flex-col items-center gap-3'
                      >
                        <div className='w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#F5F5F7] group-hover:bg-[#EAEAEA] flex items-center justify-center transition-colors p-4'>
                          {/* Replace with category icons/images */}
                          <img
                            src={`https://placehold.co/100x100/e2e8f0/64748b?text=${cat.name.charAt(0)}`}
                            alt={cat.name}
                            className='w-full h-full object-contain group-hover:scale-110 transition-transform duration-300'
                          />
                        </div>
                        <span className='text-xs md:text-sm font-semibold text-center group-hover:text-[#FF5A00] transition-colors'>
                          {cat.name}
                        </span>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </div>
            </StaggerContainer>
          </section>
        </FadeIn>

        {/* ========== FLASH DEALS ========== */}
        <FadeIn>
          <section>
            <div className='flex flex-col sm:flex-row items-center justify-between mb-8 gap-4'>
              <div className='flex items-center gap-4'>
                <h2 className='text-xl md:text-2xl font-bold tracking-tight uppercase flex items-center gap-2'>
                  <span className='text-[#FF5A00]'>🔥</span> Flash Deals
                </h2>
                <div className='flex gap-2 items-center text-sm font-bold'>
                  <span className='text-gray-500 font-normal'>Ends in:</span>
                  <div className='bg-gray-100 px-2 py-1 rounded'>
                    02
                    <span className='text-[10px] text-gray-500 block font-normal'>
                      DAYS
                    </span>
                  </div>{" "}
                  :
                  <div className='bg-gray-100 px-2 py-1 rounded'>
                    15
                    <span className='text-[10px] text-gray-500 block font-normal'>
                      HRS
                    </span>
                  </div>{" "}
                  :
                  <div className='bg-gray-100 px-2 py-1 rounded'>
                    45
                    <span className='text-[10px] text-gray-500 block font-normal'>
                      MINS
                    </span>
                  </div>
                </div>
              </div>
              <Link
                to='/shop?isFeatured=true'
                className='text-sm font-semibold text-gray-500 hover:text-[#FF5A00] flex items-center gap-1'
              >
                View all deals <HiArrowRight className='w-4 h-4' />
              </Link>
            </div>

            {isLoading ? (
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4'>
                {[...Array(5)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <StaggerContainer>
                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4'>
                  {featuredProducts.map((p) => (
                    <StaggerItem key={p._id}>
                      <ProductCard product={p} />
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            )}
          </section>
        </FadeIn>

        {/* ========== PROMO BANNERS ========== */}
        <FadeIn>
          <section className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-[#0A0D14] rounded-2xl p-8 flex items-center justify-between relative overflow-hidden group'>
              <div className='relative z-10 text-white space-y-3'>
                <span className='text-xs font-bold tracking-wider opacity-80'>
                  UP TO 50% OFF
                </span>
                <h3 className='text-2xl font-bold'>Electronics</h3>
                <p className='text-sm text-gray-400 max-w-[200px]'>
                  Shop the latest gadgets at unbeatable prices
                </p>
                <Link
                  to='/shop?category=electronics'
                  className='inline-block mt-2 bg-white text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-200 transition-colors'
                >
                  Shop Electronics →
                </Link>
              </div>
              <img
                src='https://placehold.co/250x250/0A0D14/ffffff?text=Promo+1'
                alt='Electronics Promo'
                className='absolute right-0 top-1/2 -translate-y-1/2 w-48 object-contain group-hover:scale-105 transition-transform duration-500'
              />
            </div>
            <div className='bg-[#FFEFE5] rounded-2xl p-8 flex items-center justify-between relative overflow-hidden group'>
              <div className='relative z-10 text-[#0F1111] space-y-3'>
                <h3 className='text-2xl font-bold'>
                  New Fashion
                  <br />
                  Collection
                </h3>
                <p className='text-sm text-gray-600 max-w-[200px]'>
                  Trendy styles for every occasion and season
                </p>
                <Link
                  to='/shop?category=fashion'
                  className='inline-block mt-2 bg-white border border-gray-200 text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-50 transition-colors'
                >
                  Shop Now →
                </Link>
              </div>
              <img
                src='https://placehold.co/250x250/FFEFE5/0F1111?text=Promo+2'
                alt='Fashion Promo'
                className='absolute right-0 bottom-0 w-48 object-contain group-hover:scale-105 transition-transform duration-500'
              />
            </div>
          </section>
        </FadeIn>

        {/* ========== SHOP BY LIFESTYLE (Bento Grid) ========== */}
        <FadeIn>
          <section>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl md:text-2xl font-bold tracking-tight uppercase'>
                Shop By Lifestyle
              </h2>
              <Link
                to='/collections'
                className='text-sm font-semibold text-gray-500 hover:text-[#FF5A00] flex items-center gap-1'
              >
                Explore all <HiArrowRight className='w-4 h-4' />
              </Link>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {[
                "Work From Home",
                "Gaming Setup",
                "Fitness Essentials",
                "Smart Home",
              ].map((lifestyle, i) => (
                <div
                  key={i}
                  className='relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer bg-gray-100'
                >
                  <img
                    src={`https://placehold.co/400x300/e2e8f0/64748b?text=${lifestyle.replace(/ /g, "+")}`}
                    alt={lifestyle}
                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4'>
                    <h3 className='text-white font-bold text-sm md:text-base'>
                      {lifestyle}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* ========== TABBED PRODUCTS ========== */}
        <FadeIn>
          <section>
            <div className='flex justify-center border-b border-gray-200 mb-8'>
              {["TRENDING NOW", "BEST SELLERS", "NEW ARRIVALS"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-bold transition-colors border-b-2 ${
                    activeTab === tab
                      ? "border-[#FF5A00] text-[#FF5A00]"
                      : "border-transparent text-gray-400 hover:text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <StaggerContainer key={activeTab}>
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4'>
                {getTabProducts().map((p) => (
                  <StaggerItem key={p._id}>
                    <ProductCard product={p} />
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          </section>
        </FadeIn>

        {/* ========== TOP BRANDS ========== */}
        <FadeIn>
          <section className='border-t border-gray-100 pt-10'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl md:text-2xl font-bold tracking-tight uppercase'>
                Top Brands
              </h2>
              <Link
                to='/brands'
                className='text-sm font-semibold text-gray-500 hover:text-[#FF5A00] flex items-center gap-1'
              >
                View all brands <HiArrowRight className='w-4 h-4' />
              </Link>
            </div>
            <div className='flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-60 grayscale'>
              {/* Placeholders for Brand Logos */}
              {["Apple", "Samsung", "Sony", "Nike", "Adidas", "Logitech"].map(
                (brand) => (
                  <div
                    key={brand}
                    className='text-xl font-black tracking-tighter uppercase'
                  >
                    {brand}
                  </div>
                ),
              )}
            </div>
          </section>
        </FadeIn>

        {/* ========== STATS BANNER ========== */}
        <FadeIn>
          <section className='bg-[#0A0D14] rounded-3xl p-8 my-8 shadow-xl'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x-0 lg:divide-x lg:divide-white/10'>
              <StatCounter
                value={50000}
                label='Products Available'
                suffix='+'
              />
              <StatCounter value={30000} label='Happy Customers' suffix='+' />
              <StatCounter value={500} label='Top Brands' suffix='+' />
              <StatCounter
                value={99.9}
                label='Customer Satisfaction'
                suffix='%'
              />
            </div>
          </section>
        </FadeIn>

        {/* ========== CUSTOMER REVIEWS ========== */}
        <FadeIn>
          <section>
            <div className='flex items-center justify-between mb-8'>
              <h2 className='text-xl md:text-2xl font-bold tracking-tight uppercase'>
                Our Happy Customers
              </h2>
              <span className='text-sm font-semibold text-gray-500'>
                4.8/5 from 30,000+ reviews
              </span>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className='bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between'
                >
                  <div>
                    <StarRating rating={t.rating} size='sm' />
                    <p className='text-sm text-[#0F1111] mt-3 leading-relaxed font-medium'>
                      "{t.text}"
                    </p>
                  </div>
                  <div className='flex items-center gap-3 mt-4'>
                    <div className='w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs'>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className='text-xs font-bold text-[#0F1111]'>
                        {t.name}
                      </p>
                      <p className='text-[10px] text-green-600 flex items-center gap-1 font-semibold'>
                        <HiShieldCheck className='w-3 h-3' /> {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* ========== NEWSLETTER ========== */}
        <FadeIn>
          <section className='bg-[#0A0D14] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden'>
            <div className='flex items-center gap-4 relative z-10'>
              <div className='p-4 bg-white/10 rounded-xl'>
                <HiOutlineCheckCircle className='w-8 h-8' />
              </div>
              <div>
                <h2 className='text-xl md:text-2xl font-bold tracking-tight'>
                  Get Exclusive Deals & Offers
                </h2>
                <p className='text-sm text-white/60 mt-1'>
                  Subscribe to get special offers, free giveaways and
                  once-in-a-lifetime deals.
                </p>
              </div>
            </div>

            <div className='w-full md:w-auto relative z-10'>
              <form
                onSubmit={(e) => e.preventDefault()}
                className='flex bg-white rounded-full p-1 max-w-md w-full'
              >
                <input
                  type='email'
                  required
                  placeholder='Enter your email address'
                  className='flex-1 px-4 text-sm text-black bg-transparent focus:outline-none'
                />
                <Button
                  type='submit'
                  className='!bg-[#FF5A00] hover:!bg-[#E04F00] !text-white font-bold px-6 rounded-full'
                >
                  Subscribe
                </Button>
              </form>
              <div className='flex gap-4 mt-3 text-[10px] text-white/40 justify-center md:justify-start'>
                <span>✓ Exclusive Offers</span>
                <span>✓ Early Access</span>
                <span>✓ Weekly Deals</span>
              </div>
            </div>
          </section>
        </FadeIn>
      </div>
    </div>
  );
}
