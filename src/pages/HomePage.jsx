import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchProducts } from "../features/products/productSlice";
import { categoryApi } from "../features/products/categoryApi";
import ProductCard from "../features/products/ProductCard";
import CategoryCard from "../features/products/CategoryCard";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";

const banners = [
  {
    title: "Summer Sale",
    subtitle: "Up to 50% off on selected items",
    bg: "from-[#FF9900] to-[#FFA41C]",
    emoji: "☀️",
  },
  {
    title: "New Arrivals",
    subtitle: "Check out the latest tech gadgets",
    bg: "from-[#232F3E] to-[#131A22]",
    emoji: "🚀",
  },
  {
    title: "Free Shipping",
    subtitle: "On orders over $100",
    bg: "from-[#067D62] to-[#056B50]",
    emoji: "📦",
  },
];

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { products, isLoading } = useAppSelector((state) => state.products);
  const [categories, setCategories] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    dispatch(fetchProducts({ isFeatured: true, limit: 8 }));
    categoryApi.getAll().then((res) => setCategories(res.data.data.categories));
  }, [dispatch]);

  // Auto-rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);

  return (
    <div>
      {/* Hero Banner */}
      <div
        className={`bg-gradient-to-r ${banners[currentBanner].bg} transition-all duration-700`}
      >
        <div className='max-w-7xl mx-auto px-4 py-16 md:py-24 flex items-center justify-between'>
          <div className='text-white'>
            <h1 className='text-4xl md:text-6xl font-bold mb-4'>
              {banners[currentBanner].title}
            </h1>
            <p className='text-lg md:text-xl text-white/90 mb-8'>
              {banners[currentBanner].subtitle}
            </p>
            <Button to='/shop' variant='secondary' size='lg'>
              Shop Now
            </Button>
          </div>
          <span className='text-7xl md:text-9xl hidden md:block'>
            {banners[currentBanner].emoji}
          </span>
        </div>

        {/* Banner dots */}
        <div className='flex justify-center gap-2 pb-4'>
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentBanner ? "bg-white w-8" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 py-8'>
        {/* Categories */}
        <section className='mb-12'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-[#0F1111]'>
              Shop by Category
            </h2>
            <Link
              to='/shop'
              className='text-[#FF9900] hover:underline text-sm font-medium'
            >
              View All
            </Link>
          </div>

          {categories.length > 0 ? (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
              {categories.map((cat, index) => (
                <CategoryCard key={cat._id} category={cat} index={index} />
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className='h-40 bg-[#D5D9D9] rounded-lg animate-pulse'
                />
              ))}
            </div>
          )}
        </section>

        {/* Featured Products */}
        <section>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-[#0F1111]'>
              Featured Products
            </h2>
            <Link
              to='/shop?isFeatured=true'
              className='text-[#FF9900] hover:underline text-sm font-medium'
            >
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
              {[...Array(8)].map((_, i) => (
                <div key={i} className='bg-white rounded-lg p-4 animate-pulse'>
                  <div className='aspect-square bg-[#D5D9D9] rounded-lg mb-4' />
                  <div className='h-4 bg-[#D5D9D9] rounded w-3/4 mb-2' />
                  <div className='h-4 bg-[#D5D9D9] rounded w-1/2' />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <p className='text-[#565959]'>No featured products found.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
