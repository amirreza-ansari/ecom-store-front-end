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
    gradient: "from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
    accent: "#FF9900",
    illustration: "onlineShopping",
    stats: "500+ Products",
  },
  {
    tag: "Flash Sale",
    title: "Up to 50% Off on Top Brands",
    subtitle:
      "Don't miss out on incredible deals. Premium quality at unbeatable prices.",
    cta: "Grab Deals",
    link: "/shop?isFeatured=true",
    gradient: "from-[#1a1a2e] via-[#0f3460] to-[#533483]",
    accent: "#FF6B6B",
    illustration: "shopping",
    stats: "Limited Time",
  },
  {
    tag: "Premium Audio",
    title: "Sound That Moves You",
    subtitle:
      "Experience studio-quality audio with our handpicked collection of headphones and speakers.",
    cta: "Shop Audio",
    link: "/shop?category=electronics",
    gradient: "from-[#1a1a2e] via-[#16213e] to-[#0a4d68]",
    accent: "#00D2FF",
    illustration: "mobileApp",
    stats: "Free Shipping",
  },
];

// Testimonials with real data structure
const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Verified Buyer",
    rating: 5,
    text: "Exceptional quality and lightning-fast delivery. The product exceeded all my expectations!",
  },
  {
    name: "Mike Chen",
    role: "Tech Enthusiast",
    rating: 5,
    text: "Best online shopping experience I've had. Great prices, amazing support team.",
  },
  {
    name: "Emily Davis",
    role: "Regular Customer",
    rating: 4,
    text: "Huge selection of products. The wishlist feature helps me keep track of everything I want.",
  },
];

// CountUp Hook
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
      <p className='text-3xl md:text-4xl font-extrabold text-[#0F1111]'>
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className='text-sm text-[#565959] mt-1'>{label}</p>
    </div>
  );
}

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { products, isLoading } = useAppSelector((state) => state.products);
  const [categories, setCategories] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bestSellerPage, setBestSellerPage] = useState(0);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 12 }));
    categoryApi
      .getAll()
      .then((res) => setCategories(res.data.data.categories || []));
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentSlide((p) => (p + 1) % heroSlides.length),
      5000,
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
    <div className='overflow-hidden'>
      {/* ========== HERO ========== */}
      <section
        className={`relative bg-gradient-to-br ${slide.gradient} min-h-[550px] md:min-h-[650px] flex items-center overflow-hidden transition-all duration-700`}
      >
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-20 left-10 w-72 h-72 rounded-full bg-white blur-3xl' />
          <div className='absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl' />
        </div>
        <div className='max-w-7xl mx-auto px-4 w-full'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
            <div className='text-white space-y-6 relative z-10'>
              <span
                className='inline-block px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide'
                style={{
                  backgroundColor: slide.accent + "20",
                  color: slide.accent,
                  border: `1px solid ${slide.accent}40`,
                }}
              >
                {slide.tag}
              </span>
              <h1 className='text-4xl md:text-6xl font-extrabold leading-tight tracking-tight'>
                {slide.title}
              </h1>
              <p className='text-lg text-white/70 max-w-lg leading-relaxed'>
                {slide.subtitle}
              </p>
              <div className='flex items-center gap-4'>
                <Link to={slide.link}>
                  <Button
                    size='lg'
                    className='!bg-white !text-[#0F1111] hover:!bg-white/90 font-semibold shadow-xl'
                  >
                    {slide.cta} <HiArrowRight className='w-4 h-4 ml-2' />
                  </Button>
                </Link>
                <Link
                  to='/shop'
                  className='text-white/80 hover:text-white font-medium text-sm transition-colors'
                >
                  Browse All →
                </Link>
              </div>
              <div className='flex items-center gap-6 pt-4 text-white/50 text-xs'>
                <span className='flex items-center gap-1'>
                  <HiSparkles className='w-4 h-4' /> {slide.stats}
                </span>
                <span>⭐ 4.5+ Ratings</span>
                <span>🔒 Secure Checkout</span>
              </div>
            </div>
            <div className='flex justify-center items-center'>
              <div
                className='w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center'
                style={{ backgroundColor: slide.accent + "10" }}
              >
                <Illustration
                  name={slide.illustration}
                  className='w-56 h-56 md:w-72 md:h-72'
                />
              </div>
            </div>
          </div>
        </div>
        <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2'>
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`transition-all duration-300 rounded-full ${
                i === currentSlide
                  ? "w-8 h-2.5 bg-white"
                  : "w-2.5 h-2.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ========== TRUST BAR ========== */}
      <section className='bg-white border-b border-[#D5D9D9]'>
        <div className='max-w-7xl mx-auto px-4 py-6'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
            {[
              {
                icon: "delivery",
                title: "Free Shipping",
                desc: "Orders over $100",
                color: "bg-blue-50",
              },
              {
                icon: "security",
                title: "Secure Payment",
                desc: "100% protected",
                color: "bg-green-50",
              },
              {
                icon: "success",
                title: "Easy Returns",
                desc: "30-day policy",
                color: "bg-purple-50",
              },
              {
                icon: "team",
                title: "24/7 Support",
                desc: "Always here to help",
                color: "bg-orange-50",
              },
            ].map((item) => (
              <div
                key={item.title}
                className='group flex flex-col items-center text-center p-5 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300'
              >
                <div
                  className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                >
                  <Illustration name={item.icon} className='w-8 h-8' />
                </div>
                <h3 className='font-semibold text-[#0F1111] text-sm'>
                  {item.title}
                </h3>
                <p className='text-xs text-[#565959] mt-1'>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className='max-w-7xl mx-auto px-4 py-12 space-y-20'>
        {/* ========== CATEGORIES ========== */}
        <FadeIn>
          <section>
            <div className='text-center mb-10'>
              <h2 className='text-3xl md:text-4xl font-extrabold text-[#0F1111] mb-3'>
                Shop by Category
              </h2>
              <p className='text-[#565959] max-w-lg mx-auto'>
                Browse our carefully curated collections to find exactly what
                you need
              </p>
            </div>
            <StaggerContainer>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
                {categories.slice(0, 6).map((cat, index) => {
                  const catProduct = products.find(
                    (p) =>
                      p.category?._id === cat._id || p.category === cat._id,
                  );
                  return (
                    <StaggerItem key={cat._id}>
                      <Link
                        to={`/shop?category=${cat._id}`}
                        className='group relative bg-white rounded-2xl border border-[#D5D9D9] hover:border-[#FF9900] hover:shadow-xl transition-all duration-300 overflow-hidden'
                      >
                        <div className='aspect-square bg-[#F7FAFA] overflow-hidden'>
                          {catProduct?.images?.[0]?.url ? (
                            <img
                              src={catProduct.images[0].url}
                              alt={cat.name}
                              className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
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
                                  ][index]
                                }
                                className='w-16 h-16 opacity-50'
                              />
                            </div>
                          )}
                        </div>
                        <div className='p-3 text-center bg-white'>
                          <h3 className='font-semibold text-[#0F1111] text-sm'>
                            {cat.name}
                          </h3>
                          {cat.subcategories?.length > 0 && (
                            <p className='text-xs text-[#565959] mt-0.5'>
                              {cat.subcategories.length} categories
                            </p>
                          )}
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
                <h2 className='text-3xl md:text-4xl font-extrabold text-[#0F1111] mb-2'>
                  Featured Products
                </h2>
                <p className='text-[#565959]'>Our top picks just for you</p>
              </div>
              <Link
                to='/shop?isFeatured=true'
                className='hidden md:flex items-center gap-1 text-[#FF9900] hover:underline font-medium text-sm'
              >
                View All <HiArrowRight className='w-4 h-4' />
              </Link>
            </div>
            {isLoading ? (
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
                {[...Array(4)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <StaggerContainer>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
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

        {/* ========== DEAL OF THE DAY ========== */}
        {featuredProducts[0] && (
          <FadeIn>
            <section className='relative bg-gradient-to-br from-[#B12704] to-[#FF6B6B] rounded-3xl overflow-hidden p-8 md:p-12'>
              <div className='absolute inset-0 opacity-10'>
                <div className='absolute top-0 right-0 w-72 h-72 rounded-full bg-white blur-3xl' />
              </div>
              <div className='relative z-10 flex flex-col md:flex-row items-center justify-between gap-8'>
                <div className='text-white'>
                  <div className='flex items-center gap-2 mb-3'>
                    <HiFire className='w-6 h-6' />
                    <span className='text-sm font-bold uppercase tracking-wider'>
                      Deal of the Day
                    </span>
                  </div>
                  <h2 className='text-3xl md:text-4xl font-extrabold mb-2'>
                    {featuredProducts[0].name}
                  </h2>
                  <PriceDisplay
                    price={featuredProducts[0].price}
                    comparePrice={featuredProducts[0].comparePrice}
                    size='lg'
                  />
                  <Link to={`/product/${featuredProducts[0].slug}`}>
                    <Button
                      variant='secondary'
                      size='lg'
                      className='mt-6 !bg-white !text-[#B12704] hover:!bg-white/90 font-bold'
                    >
                      Grab the Deal <HiArrowRight className='w-4 h-4 ml-2' />
                    </Button>
                  </Link>
                </div>
                <div className='w-52 h-52 md:w-64 md:h-64 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center overflow-hidden'>
                  {featuredProducts[0].images?.[0]?.url ? (
                    <img
                      src={featuredProducts[0].images[0].url}
                      alt={featuredProducts[0].name}
                      className='w-full h-full object-contain p-6'
                    />
                  ) : (
                    <Illustration name='celebration' className='w-32 h-32' />
                  )}
                </div>
              </div>
            </section>
          </FadeIn>
        )}

        {/* ========== BEST SELLERS ========== */}
        <FadeIn>
          <section>
            <div className='flex items-end justify-between mb-8'>
              <div>
                <h2 className='text-3xl md:text-4xl font-extrabold text-[#0F1111] mb-2'>
                  Best Sellers
                </h2>
                <p className='text-[#565959]'>Most loved by our customers</p>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() =>
                    setBestSellerPage(Math.max(0, bestSellerPage - 1))
                  }
                  className='p-2.5 rounded-xl border border-[#D5D9D9] hover:bg-[#F7FAFA] transition-colors'
                >
                  <HiArrowLeft className='w-4 h-4' />
                </button>
                <button
                  onClick={() =>
                    setBestSellerPage(Math.min(1, bestSellerPage + 1))
                  }
                  className='p-2.5 rounded-xl border border-[#D5D9D9] hover:bg-[#F7FAFA] transition-colors'
                >
                  <HiArrowRight className='w-4 h-4' />
                </button>
              </div>
            </div>
            <StaggerContainer>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
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
            <div className='text-center mb-10'>
              <h2 className='text-3xl md:text-4xl font-extrabold text-[#0F1111] mb-3'>
                New Arrivals
              </h2>
              <p className='text-[#565959]'>
                Fresh drops you don't want to miss
              </p>
            </div>
            <StaggerContainer>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
                {newArrivals.map((p) => (
                  <StaggerItem key={p._id}>
                    <ProductCard product={p} />
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          </section>
        </FadeIn>

        {/* ========== STATS ========== */}
        <FadeIn>
          <section className='bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#D5D9D9]'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
              <StatCounter value={15000} label='Happy Customers' suffix='+' />
              <StatCounter value={500} label='Products' suffix='+' />
              <StatCounter value={50} label='Brands' suffix='+' />
              <StatCounter value={98} label='Satisfaction' suffix='%' />
            </div>
          </section>
        </FadeIn>

        {/* ========== TESTIMONIALS ========== */}
        <FadeIn>
          <section>
            <div className='text-center mb-10'>
              <h2 className='text-3xl md:text-4xl font-extrabold text-[#0F1111] mb-3'>
                What Customers Say
              </h2>
              <p className='text-[#565959]'>Real reviews from real shoppers</p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className='bg-white rounded-2xl p-6 shadow-sm border border-[#D5D9D9] hover:shadow-md transition-shadow'
                >
                  <StarRating rating={t.rating} size='sm' />
                  <p className='text-sm text-[#0F1111] mt-3 leading-relaxed italic'>
                    "{t.text}"
                  </p>
                  <div className='flex items-center gap-3 mt-4 pt-4 border-t border-[#D5D9D9]'>
                    <div className='w-10 h-10 bg-gradient-to-br from-[#FF9900] to-[#FF6B6B] rounded-full flex items-center justify-center text-white font-bold text-sm'>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className='text-sm font-semibold'>{t.name}</p>
                      <p className='text-xs text-[#565959] flex items-center gap-1'>
                        <HiStar className='w-3 h-3 text-[#FFA41C]' /> {t.role}
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
          <section className='bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden'>
            <div className='absolute inset-0 opacity-10'>
              <div className='absolute top-0 left-10 w-56 h-56 rounded-full bg-white blur-3xl' />
              <div className='absolute bottom-0 right-10 w-56 h-56 rounded-full bg-[#FF9900] blur-3xl' />
            </div>
            <div className='relative z-10 max-w-xl mx-auto'>
              <Illustration
                name='newsletter'
                className='w-24 h-24 mx-auto mb-6 opacity-80'
              />
              <h2 className='text-3xl md:text-4xl font-extrabold mb-3'>
                Stay in the Loop
              </h2>
              <p className='text-white/60 mb-6'>
                Subscribe for exclusive deals, new arrivals, and insider
                updates.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className='flex gap-2 max-w-md mx-auto'
              >
                <input
                  type='email'
                  placeholder='Enter your email'
                  className='flex-1 placeholder-white  text-white px-4 py-3 rounded-xl text-sm text-[#0F1111] focus:outline-none focus:ring-2 focus:ring-[#FF9900] border-amber-600 border-2'
                />
                <Button type='submit' size='lg'>
                  Subscribe
                </Button>
              </form>
              <p className='text-xs text-white/30 mt-3'>
                No spam, unsubscribe anytime.
              </p>
            </div>
          </section>
        </FadeIn>
      </div>
    </div>
  );
}
