import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchProducts } from "../features/products/productSlice";
import { categoryApi } from "../features/products/categoryApi";
import ProductCard from "../features/products/ProductCard";
import ProductCardSkeleton from "../features/products/ProductCardSkeleton";
import Illustration from "../components/ui/Illustration";
import Button from "../components/ui/Button";
import StarRating from "../components/ui/StarRating";
import PriceDisplay from "../components/ui/PriceDisplay";
import FadeIn from "../components/ui/FadeIn";
import { StaggerContainer, StaggerItem } from "../components/ui/StaggerList";
import {
  HiArrowRight,
  HiArrowLeft,
  HiFire,
  HiSparkles,
  HiStar,
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineUser,
  HiMagnifyingGlass,
  HiBars3,
  HiXMark,
  HiTruck,
  HiShieldCheck,
  HiArrowPath,
  HiPhone,
} from "react-icons/hi2";

// Hero slides
const heroSlides = [
  {
    tag: "New Collection",
    title: "Elevate Your Tech Game",
    subtitle:
      "Discover cutting-edge gadgets designed to make life smarter, faster, and more connected.",
    cta: "Explore Now",
    link: "/shop?sort=-createdAt",
    gradient: "from-[#0B0F19] via-[#111827] to-[#1F2937]",
    accent: "#FF9900",
    illustration: "onlineShopping",
    stats: "500+ Products",
  },
  {
    tag: "Flash Sale",
    title: "Up to 50% Off Top Brands",
    subtitle:
      "Don't miss out on incredible deals. Premium quality at completely unbeatable prices.",
    cta: "Grab Deals",
    link: "/shop?isFeatured=true",
    gradient: "from-[#0F0C20] via-[#15102A] to-[#2D1B4E]",
    accent: "#FF6B6B",
    illustration: "shopping",
    stats: "Limited Time Offer",
  },
  {
    tag: "Premium Audio",
    title: "Sound That Moves You",
    subtitle:
      "Experience studio-quality audio with our handpicked collection of headphones and speakers.",
    cta: "Shop Audio",
    link: "/shop?category=electronics",
    gradient: "from-[#071624] via-[#0B223A] to-[#113654]",
    accent: "#00D2FF",
    illustration: "mobileApp",
    stats: "Free Delivery Included",
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Verified Buyer",
    rating: 5,
    text: "Exceptional build quality and lightning-fast delivery. The item exceeded all expectations!",
  },
  {
    name: "Mike Chen",
    role: "Tech Enthusiast",
    rating: 5,
    text: "Best digital shopping experience I've had. Great prices paired with an amazing support team.",
  },
  {
    name: "Emily Davis",
    role: "Regular Customer",
    rating: 4,
    text: "Huge selection of products. The dashboard wishlist helps me track price drops perfectly.",
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
    <div ref={ref} className='text-center p-4'>
      <p className='text-3xl md:text-4xl font-black text-[#0F1111] tracking-tight'>
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className='text-xs font-medium text-[#565959] mt-1 uppercase tracking-wider'>
        {label}
      </p>
    </div>
  );
}

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { products, isLoading } = useAppSelector((state) => state.products);
  const [categories, setCategories] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bestSellerPage, setBestSellerPage] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 12 }));
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
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);
  const bestSellers = [...products]
    .sort((a, b) => (b.ratingsQuantity || 0) - (a.ratingsQuantity || 0))
    .slice(0, 6);

  return (
    <div className='overflow-hidden bg-[#F7FAFA] min-h-screen font-sans antialiased text-[#0F1111]'>
      {/* ========== HERO SECTION ========== */}
      <section
        className={`relative bg-gradient-to-br ${slide.gradient} min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden transition-all duration-1000`}
      >
        <div className='absolute inset-0 opacity-[0.03] pointer-events-none'>
          <div className='absolute top-20 left-10 w-72 h-72 rounded-full bg-white blur-3xl animate-pulse' />
          <div className='absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl' />
        </div>

        <div className='max-w-7xl mx-auto px-4 py-12 w-full relative z-10'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
            {/* Left Column Text details */}
            <div className='text-white space-y-6 text-center md:text-left order-2 md:order-1'>
              <span
                className='inline-block px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase transition-all'
                style={{
                  backgroundColor: slide.accent + "15",
                  color: slide.accent,
                  border: `1px solid ${slide.accent}30`,
                }}
              >
                {slide.tag}
              </span>
              <h1 className='text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight drop-shadow-sm'>
                {slide.title}
              </h1>
              <p className='text-base sm:text-lg text-white/70 max-w-lg mx-auto md:mx-0 leading-relaxed font-light'>
                {slide.subtitle}
              </p>

              <div className='flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2'>
                <Link to={slide.link} className='w-full sm:w-auto'>
                  <Button
                    size='lg'
                    className='w-full sm:w-auto !bg-white !text-[#0F1111] hover:!bg-white/90 font-bold shadow-xl transition-all hover:-translate-y-0.5 rounded-xl flex items-center justify-center'
                  >
                    {slide.cta} <HiArrowRight className='w-4 h-4 ml-2' />
                  </Button>
                </Link>
                <Link
                  to='/shop'
                  className='text-white/80 hover:text-white font-semibold text-sm transition-colors py-2 flex items-center gap-1 group'
                >
                  Browse Catalog{" "}
                  <span className='group-hover:translate-x-1 transition-transform'>
                    →
                  </span>
                </Link>
              </div>

              <div className='flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 pt-6 text-white/60 text-[11px] font-medium border-t border-white/10'>
                <span className='flex items-center gap-1.5'>
                  <HiSparkles className='w-4 h-4 text-[#FF9900]' />{" "}
                  {slide.stats}
                </span>
                <span>• ⭐ 4.9+ User Ratings</span>
                <span>• 🔒 Fully Encrypted Checkout</span>
              </div>
            </div>

            {/* Right Column Illustration wrapper */}
            <div className='flex justify-center items-center order-1 md:order-2'>
              <div
                className='w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-3xl flex items-center justify-center transition-transform duration-700 hover:scale-105'
                style={{ backgroundColor: slide.accent + "0A" }}
              >
                <Illustration
                  name={slide.illustration}
                  className='w-48 h-48 sm:w-60 sm:h-60 md:w-80 md:h-80 object-contain drop-shadow-2xl'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Carousel indicators */}
        <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5'>
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`transition-all duration-300 rounded-full h-2 ${
                i === currentSlide
                  ? "w-8 bg-white"
                  : "w-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ========== TRUST / FEATURES BAR ========== */}
      <section className='bg-white border-b border-[#E7E7E7]'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-6'>
            {[
              {
                icon: HiTruck,
                title: "Free Shipping",
                desc: "On absolute orders over $100",
                color: "text-blue-600 bg-blue-50",
              },
              {
                icon: HiShieldCheck,
                title: "Secure Payments",
                desc: "100% protected checkout",
                color: "text-green-600 bg-green-50",
              },
              {
                icon: HiArrowPath,
                title: "Easy Returns",
                desc: "30-day structural guarantee",
                color: "text-purple-600 bg-purple-50",
              },
              {
                icon: HiPhone,
                title: "Expert Support 24/7",
                desc: "Dedicated live tech assistance",
                color: "text-orange-600 bg-orange-50",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className='flex gap-4 items-center p-3 rounded-xl hover:bg-[#F7FAFA] transition-colors duration-200'
              >
                <div
                  className={`w-12 h-12 shrink-0 ${item.color} rounded-xl flex items-center justify-center text-xl`}
                >
                  <item.icon className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='font-bold text-[#0F1111] text-sm leading-tight'>
                    {item.title}
                  </h3>
                  <p className='text-xs text-[#565959] mt-0.5'>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className='max-w-7xl mx-auto px-4 py-16 space-y-24'>
        {/* ========== CATEGORIES SECTION ========== */}
        <FadeIn>
          <section>
            <div className='flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4'>
              <div>
                <h2 className='text-2xl md:text-3xl font-black tracking-tight text-[#0F1111]'>
                  Shop by Category
                </h2>
                <p className='text-sm text-[#565959] mt-1'>
                  Browse our handpicked tech ecosystems curated cleanly for you
                </p>
              </div>
            </div>

            <StaggerContainer>
              {/* Uses mobile horizontal scrolling, grid rules apply above standard breakpoint sizing */}
              <div className='flex overflow-x-auto pb-4 gap-4 scrollbar-none snap-x md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible md:pb-0'>
                {categories.slice(0, 6).map((cat, index) => {
                  const catProduct = products.find(
                    (p) =>
                      p.category?._id === cat._id || p.category === cat._id,
                  );
                  return (
                    <StaggerItem
                      key={cat._id}
                      className='w-40 shrink-0 snap-start md:w-auto'
                    >
                      <Link
                        to={`/shop?category=${cat._id}`}
                        className='group flex flex-col h-full bg-white rounded-2xl border border-[#E7E7E7] hover:border-[#FF9900] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden'
                      >
                        <div className='aspect-square bg-[#F7FAFA] overflow-hidden relative'>
                          {catProduct?.images?.[0]?.url ? (
                            <img
                              src={catProduct.images[0].url}
                              alt={cat.name}
                              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center'>
                              <Illustration
                                name={
                                  [
                                    "shopping",
                                    "mobileApp",
                                    "delivery",
                                    "celebration",
                                    "team",
                                    "success",
                                  ][index % 6]
                                }
                                className='w-14 h-14 opacity-40'
                              />
                            </div>
                          )}
                        </div>
                        <div className='p-3 text-center border-t border-[#E7E7E7] bg-white flex-1 flex flex-col justify-center'>
                          <h3 className='font-bold text-[#0F1111] text-xs sm:text-sm tracking-tight truncate'>
                            {cat.name}
                          </h3>
                        </div>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </div>
            </StaggerContainer>
          </section>
        </FadeIn>

        {/* ========== FEATURED PRODUCTS ========== */}
        <FadeIn>
          <section>
            <div className='flex items-end justify-between mb-8'>
              <div>
                <h2 className='text-2xl md:text-3xl font-black tracking-tight text-[#0F1111]'>
                  Featured Innovations
                </h2>
                <p className='text-sm text-[#565959] mt-1'>
                  Our absolute premium product picks
                </p>
              </div>
              <Link
                to='/shop?isFeatured=true'
                className='flex items-center gap-1 text-[#FF9900] hover:text-[#E88B00] font-bold text-sm group'
              >
                View All{" "}
                <HiArrowRight className='w-4 h-4 group-hover:translate-x-0.5 transition-transform' />
              </Link>
            </div>

            {isLoading ? (
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <StaggerContainer>
                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
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

        {/* ========== DEAL OF THE DAY HERO BANNER ========== */}
        {featuredProducts[0] && (
          <FadeIn>
            <section className='relative bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] rounded-3xl overflow-hidden shadow-xl'>
              <div className='absolute right-0 top-0 w-1/2 h-full opacity-10 bg-radial-gradient from-white/20 to-transparent pointer-events-none' />
              <div className='relative z-10 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8'>
                <div className='text-white space-y-4 text-center md:text-left max-w-xl'>
                  <div className='inline-flex items-center gap-2 bg-[#FF9900]/20 text-[#FF9900] border border-[#FF9900]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider'>
                    <HiFire className='w-4 h-4' /> Deal of the Day
                  </div>
                  <h2 className='text-2xl sm:text-4xl font-black tracking-tight leading-tight'>
                    {featuredProducts[0].name}
                  </h2>
                  <div className='flex justify-center md:justify-start items-center pt-1'>
                    <PriceDisplay
                      price={featuredProducts[0].price}
                      comparePrice={featuredProducts[0].comparePrice}
                      size='lg'
                    />
                  </div>
                  <div className='pt-2'>
                    <Link to={`/product/${featuredProducts[0].slug}`}>
                      <Button
                        variant='secondary'
                        size='lg'
                        className='w-full sm:w-auto !bg-[#FF9900] !text-white hover:!bg-[#E88B00] font-bold shadow-lg rounded-xl transition-transform hover:-translate-y-0.5'
                      >
                        Grab the Offer <HiArrowRight className='w-4 h-4 ml-2' />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className='w-48 h-48 sm:w-64 sm:h-64 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-2xl p-6 group'>
                  {featuredProducts[0].images?.[0]?.url ? (
                    <img
                      src={featuredProducts[0].images[0].url}
                      alt={featuredProducts[0].name}
                      className='w-full h-full object-contain group-hover:scale-105 transition-transform duration-500'
                    />
                  ) : (
                    <Illustration name='celebration' className='w-24 h-24' />
                  )}
                </div>
              </div>
            </section>
          </FadeIn>
        )}

        {/* ========== BEST SELLERS ========== */}
        <FadeIn>
          <section>
            <div className='flex items-center justify-between mb-8'>
              <div>
                <h2 className='text-2xl md:text-3xl font-black tracking-tight text-[#0F1111]'>
                  Best Sellers
                </h2>
                <p className='text-sm text-[#565959] mt-1'>
                  Verified crowd favorites backed by top performance feedback
                </p>
              </div>

              {/* Pagination controls */}
              <div className='flex gap-2'>
                <button
                  disabled={bestSellerPage === 0}
                  onClick={() =>
                    setBestSellerPage(Math.max(0, bestSellerPage - 1))
                  }
                  className='p-2 rounded-xl border border-[#D5D9D9] bg-white hover:bg-[#F7FAFA] disabled:opacity-40 transition-colors shadow-sm'
                >
                  <HiArrowLeft className='w-4 h-4' />
                </button>
                <button
                  disabled={(bestSellerPage + 1) * 3 >= bestSellers.length}
                  onClick={() => setBestSellerPage((p) => p + 1)}
                  className='p-2 rounded-xl border border-[#D5D9D9] bg-white hover:bg-[#F7FAFA] disabled:opacity-40 transition-colors shadow-sm'
                >
                  <HiArrowRight className='w-4 h-4' />
                </button>
              </div>
            </div>

            <StaggerContainer>
              {/* Displays elegantly inside standard flex layouts or grid layouts without rendering breaking white spaces */}
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4'>
                {bestSellers
                  .slice(bestSellerPage * 3, bestSellerPage * 3 + 3)
                  .map((p) => (
                    <StaggerItem key={p._id}>
                      <ProductCard product={p} />
                    </StaggerItem>
                  ))}
              </div>
            </StaggerContainer>
          </section>
        </FadeIn>

        {/* ========== NEW ARRIVALS ========== */}
        <FadeIn>
          <section>
            <div className='text-center max-w-xl mx-auto mb-10'>
              <h2 className='text-2xl md:text-3xl font-black tracking-tight text-[#0F1111]'>
                Fresh Product Drops
              </h2>
              <p className='text-sm text-[#565959] mt-1'>
                Keep track of brand new premium arrivals updated live on our
                inventory maps daily
              </p>
            </div>

            <StaggerContainer>
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
                {newArrivals.map((p) => (
                  <StaggerItem key={p._id}>
                    <ProductCard product={p} />
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          </section>
        </FadeIn>

        {/* ========== METRIC STATS COUNTERS ========== */}
        <FadeIn>
          <section className='bg-white rounded-3xl p-8 border border-[#E7E7E7] shadow-sm'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x-0 lg:divide-x lg:divide-[#E7E7E7]'>
              <StatCounter value={15000} label='Active Users' suffix='+' />
              <StatCounter value={500} label='Curated Gadgets' suffix='+' />
              <StatCounter value={50} label='Official Partners' suffix='+' />
              <StatCounter value={99} label='Satisfaction Rate' suffix='%' />
            </div>
          </section>
        </FadeIn>

        {/* ========== CUSTOMER REVIEWS ========== */}
        <FadeIn>
          <section>
            <div className='text-center max-w-xl mx-auto mb-12'>
              <h2 className='text-2xl md:text-3xl font-black tracking-tight text-[#0F1111]'>
                Verified Experiences
              </h2>
              <p className='text-sm text-[#565959] mt-1'>
                Read accurate global reviews submitted straight from our user
                base
              </p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className='bg-white rounded-2xl p-6 border border-[#E7E7E7] shadow-sm hover:shadow-md transition-all flex flex-col justify-between'
                >
                  <div>
                    <StarRating rating={t.rating} size='sm' />
                    <p className='text-sm text-[#0F1111] mt-4 leading-relaxed font-light text-neutral-600'>
                      "{t.text}"
                    </p>
                  </div>
                  <div className='flex items-center gap-3 mt-6 pt-4 border-t border-[#E7E7E7]'>
                    <div className='w-9 h-9 bg-gradient-to-br from-[#FF9900] to-[#FF6B6B] rounded-full flex items-center justify-center text-white font-black text-xs shadow-inner'>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className='text-xs font-bold text-[#0F1111]'>
                        {t.name}
                      </p>
                      <p className='text-[10px] text-[#565959] flex items-center gap-0.5 mt-0.5 uppercase tracking-wider font-semibold'>
                        <HiStar className='w-3 h-3 text-[#FFA41C]' /> {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* ========== MARKETING NEWSLETTER ========== */}
        <FadeIn>
          <section className='bg-gradient-to-br from-[#0F1111] to-[#1F2937] rounded-3xl p-8 md:p-12 lg:p-16 text-center text-white relative overflow-hidden shadow-2xl'>
            <div className='absolute inset-0 opacity-[0.02] pointer-events-none'>
              <div className='absolute top-0 left-10 w-72 h-72 rounded-full bg-white blur-3xl animate-pulse' />
              <div className='absolute bottom-0 right-10 w-72 h-72 rounded-full bg-[#FF9900] blur-3xl' />
            </div>

            <div className='relative z-10 max-w-xl mx-auto space-y-6'>
              <Illustration
                name='newsletter'
                className='w-20 h-20 mx-auto opacity-90 filter drop-shadow-lg'
              />
              <div className='space-y-2'>
                <h2 className='text-2xl md:text-3xl font-black tracking-tight'>
                  Stay inside the Loop
                </h2>
                <p className='text-sm text-white/60 font-light'>
                  Subscribe to receive immediate markdown deal notifications,
                  flash drops, and premium inventory updates.
                </p>
              </div>

              <form
                onSubmit={(e) => e.preventDefault()}
                className='flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2'
              >
                <input
                  type='email'
                  required
                  placeholder='Enter your personal email address'
                  className='flex-1 placeholder-white/40 text-white bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent transition-all'
                />
                <Button
                  type='submit'
                  size='lg'
                  className='!bg-[#FF9900] hover:!bg-[#E88B00] !text-white font-bold px-6 shadow-md rounded-xl transition-all'
                >
                  Subscribe
                </Button>
              </form>
              <p className='text-[10px] text-white/30 font-medium'>
                Zero spam policy. Unsubscribe anytime with a single click
                tracking link.
              </p>
            </div>
          </section>
        </FadeIn>
      </div>
    </div>
  );
}
