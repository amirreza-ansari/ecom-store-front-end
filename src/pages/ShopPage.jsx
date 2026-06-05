import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchProducts } from "../features/products/productSlice";
import { categoryApi } from "../features/products/categoryApi";
import ProductCard from "../features/products/ProductCard";
import Pagination from "../components/ui/Pagination";
import ProductCardSkeleton from "../features/products/ProductCardSkeleton";
import { StaggerContainer, StaggerItem } from "../components/ui/StaggerList";
import {
  HiFunnel,
  HiXMark,
  HiMagnifyingGlass,
  HiOutlineReceiptPercent,
  HiOutlineTruck,
} from "react-icons/hi2";

export default function ShopPage() {
  const dispatch = useAppDispatch();
  const { products, pagination, isLoading } = useAppSelector(
    (state) => state.products,
  );
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Current filter values from URL
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentInStock = searchParams.get("inStock") || "";
  const currentFeatured = searchParams.get("isFeatured") || "";

  // Fetch products when params change
  useEffect(() => {
    const params = {};
    if (currentPage > 1) params.page = currentPage;
    if (currentSearch) params.search = currentSearch;
    if (currentCategory) params.category = currentCategory;
    if (currentSort) params.sort = currentSort;
    if (currentMinPrice) params.minPrice = currentMinPrice;
    if (currentMaxPrice) params.maxPrice = currentMaxPrice;
    if (currentInStock === "true") params.inStock = "true";
    if (currentFeatured === "true") params.isFeatured = "true";

    dispatch(fetchProducts(params));
  }, [
    dispatch,
    currentPage,
    currentSearch,
    currentCategory,
    currentSort,
    currentMinPrice,
    currentMaxPrice,
    currentInStock,
    currentFeatured,
  ]);

  // Fetch categories
  useEffect(() => {
    categoryApi.getAll().then((res) => setCategories(res.data.data.categories));
  }, []);

  // Update URL params - Fixed to strictly check against undefined/null/empty strings
  const updateParams = useCallback(
    (key, value) => {
      const newParams = new URLSearchParams(searchParams);
      if (value !== "" && value !== null && value !== undefined) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      if (key !== "page") newParams.set("page", "1");
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const updateMultipleParams = useCallback(
    (paramsObj) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(paramsObj).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      newParams.set("page", "1");
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const handlePageChange = (page) => {
    updateParams("page", page.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters =
    currentCategory ||
    currentSearch ||
    currentSort ||
    currentMinPrice ||
    currentMaxPrice ||
    currentInStock ||
    currentFeatured;

  return (
    <div className='max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-gray-900 bg-white'>
      {/* Top Breadcrumb */}
      <div className='text-sm text-gray-500 mb-6 font-medium'>
        Home <span className='mx-2 text-gray-400'>&gt;</span>{" "}
        <span className='text-gray-900'>Shop</span>
      </div>

      {/* Header & Promo Banners */}
      <div className='flex flex-col xl:flex-row xl:items-start justify-between gap-8 mb-10'>
        <div className='flex-shrink-0'>
          <h1 className='text-4xl font-extrabold tracking-tight text-gray-900 uppercase'>
            Shop
          </h1>
          {pagination && (
            <p className='mt-2 text-sm text-gray-500 font-medium'>
              Showing 1-{products.length} of {pagination.total} products
            </p>
          )}
        </div>

        <div className='flex flex-col sm:flex-row gap-4 flex-1 xl:max-w-4xl'>
          <div className='flex-1 bg-[#FFF4ED] rounded-xl p-5 flex items-center gap-5 border border-orange-100'>
            <div className='w-12 h-12 rounded-full bg-[#FFDED0] flex items-center justify-center text-[#FF5722] shrink-0'>
              <HiOutlineReceiptPercent className='w-6 h-6' />
            </div>
            <div>
              <h3 className='font-bold text-gray-900'>Save up to 50%</h3>
              <p className='text-xs text-gray-600 mt-1'>
                Don't miss our amazing deals on electronics & accessories
              </p>
              <button className='text-[#FF5722] text-xs font-bold mt-2 hover:underline'>
                Shop Deals →
              </button>
            </div>
          </div>
          <div className='flex-1 bg-[#F5F8FF] rounded-xl p-5 flex items-center gap-5 border border-blue-50'>
            <div className='w-12 h-12 rounded-full bg-[#E0E8FF] flex items-center justify-center text-[#2563EB] shrink-0'>
              <HiOutlineTruck className='w-6 h-6' />
            </div>
            <div>
              <h3 className='font-bold text-gray-900'>Free Shipping</h3>
              <p className='text-xs text-gray-600 mt-1'>
                Free shipping on all orders over $50.00
              </p>
              <button className='text-[#2563EB] text-xs font-bold mt-2 hover:underline'>
                Learn More →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='flex gap-10 items-start'>
        {/* Left Sidebar - Desktop */}
        <aside className='hidden lg:block w-[240px] shrink-0 sticky top-8'>
          <FiltersPanel
            categories={categories}
            currentCategory={currentCategory}
            currentMinPrice={currentMinPrice}
            currentMaxPrice={currentMaxPrice}
            currentSearch={currentSearch}
            updateParams={updateParams}
            updateMultipleParams={updateMultipleParams}
          />
        </aside>

        {/* Main Content Area */}
        <div className='flex-1 w-full'>
          <div className='flex flex-wrap items-center justify-between gap-4 mb-6'>
            <div className='flex flex-wrap items-center gap-6'>
              <button
                onClick={() => setShowFilters(true)}
                className='lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium'
              >
                <HiFunnel className='w-4 h-4' /> Filters
              </button>

              <div className='hidden sm:flex items-center gap-6'>
                <label className='flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={currentFeatured === "true"}
                    onChange={(e) =>
                      updateParams("isFeatured", e.target.checked ? "true" : "")
                    }
                    className='w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900'
                  />
                  Featured Only
                </label>
                <label className='flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={currentInStock === "true"}
                    onChange={(e) =>
                      updateParams("inStock", e.target.checked ? "true" : "")
                    }
                    className='w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900'
                  />
                  In Stock Only
                </label>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className='text-sm font-bold text-[#FF5722] hover:text-[#E64A19] transition-colors'
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <span className='text-sm font-medium text-gray-600'>
                Sort by:
              </span>
              <select
                value={currentSort}
                onChange={(e) => updateParams("sort", e.target.value)}
                className='px-4 py-2 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all font-medium text-gray-900 cursor-pointer appearance-none min-w-[140px]'
              >
                <option value=''>Popular</option>
                <option value='-createdAt'>Newest Arrivals</option>
                <option value='price'>Price: Low to High</option>
                <option value='-price'>Price: High to Low</option>
                <option value='-ratingsAverage'>Customer Rating</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6'>
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <StaggerContainer>
                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6'>
                  {products.map((product) => (
                    <StaggerItem key={product._id}>
                      <ProductCard product={product} />
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>

              {pagination && pagination.pages > 1 && (
                <div className='mt-12 flex justify-center pt-6'>
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className='text-center py-20 border border-dashed border-gray-200 rounded-2xl mt-6'>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>
                No products found
              </h3>
              <p className='text-gray-500 text-sm mb-6'>
                Try adjusting your filters or search terms.
              </p>
              <button
                onClick={clearFilters}
                className='px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-all'
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showFilters && (
        <div className='fixed inset-0 z-50 lg:hidden flex justify-start'>
          <div
            className='fixed inset-0 bg-black/50 backdrop-blur-sm'
            onClick={() => setShowFilters(false)}
          />
          <div className='relative w-[280px] bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto'>
            <div className='p-5 flex items-center justify-between border-b border-gray-100'>
              <h2 className='font-bold text-gray-900'>Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className='p-2 hover:bg-gray-100 rounded-full'
              >
                <HiXMark className='w-5 h-5 text-gray-500' />
              </button>
            </div>
            <div className='p-5'>
              <FiltersPanel
                categories={categories}
                currentCategory={currentCategory}
                currentMinPrice={currentMinPrice}
                currentMaxPrice={currentMaxPrice}
                currentSearch={currentSearch}
                updateParams={updateParams}
                updateMultipleParams={updateMultipleParams}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FiltersPanel({
  categories,
  currentCategory,
  currentMinPrice,
  currentMaxPrice,
  currentSearch,
  updateParams,
  updateMultipleParams,
}) {
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [localMinPrice, setLocalMinPrice] = useState(currentMinPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(currentMaxPrice);

  // Sync inputs with URL params (handles clear filters scenario)
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    setLocalMinPrice(currentMinPrice);
    setLocalMaxPrice(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams("search", searchInput);
  };

  const handleCustomPriceSubmit = (e) => {
    e.preventDefault();
    updateMultipleParams({
      minPrice: localMinPrice,
      maxPrice: localMaxPrice,
    });
  };

  const renderCategoryOptions = (cats, level = 0) => {
    return cats.flatMap((cat) => {
      const isSelected = currentCategory === cat._id;
      return [
        <button
          key={cat._id}
          type='button'
          onClick={() => updateParams("category", cat._id)}
          className={`flex items-center justify-between w-full text-left text-sm py-2 transition-all ${
            isSelected
              ? "text-gray-900 font-bold"
              : "text-gray-600 hover:text-gray-900 font-medium"
          }`}
          style={{ paddingLeft: `${level * 12}px` }}
        >
          <span className='truncate'>{cat.name}</span>
        </button>,
        ...(cat.subcategories?.length > 0
          ? renderCategoryOptions(cat.subcategories, level + 1)
          : []),
      ];
    });
  };

  return (
    <div className='space-y-10'>
      {/* Categories */}
      <div>
        <h3 className='text-sm font-bold text-gray-900 uppercase tracking-wider mb-4'>
          Categories
        </h3>
        <div className='space-y-1'>
          <button
            type='button'
            onClick={() => updateParams("category", "")}
            className={`flex items-center justify-between w-full text-left text-sm py-2 transition-colors ${
              !currentCategory
                ? "text-gray-900 font-bold"
                : "text-gray-600 hover:text-gray-900 font-medium"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => renderCategoryOptions([cat]))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className='text-sm font-bold text-gray-900 uppercase tracking-wider mb-4'>
          Price Range
        </h3>

        {/* Custom Price Inputs Form */}
        <form onSubmit={handleCustomPriceSubmit} className='mb-6'>
          <div className='flex items-center gap-2'>
            <input
              type='number'
              min='0'
              placeholder='Min'
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              className='w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-gray-900 transition-all placeholder-gray-400'
            />
            <span className='text-gray-400 font-medium'>-</span>
            <input
              type='number'
              min='0'
              placeholder='Max'
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              className='w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-gray-900 transition-all placeholder-gray-400'
            />
            <button
              type='submit'
              className='px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors'
            >
              Go
            </button>
          </div>
        </form>

        {/* Quick Range Pills */}
        <div className='grid grid-cols-2 gap-2'>
          <button
            onClick={() =>
              updateMultipleParams({ minPrice: "", maxPrice: "25" })
            }
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              !currentMinPrice && currentMaxPrice === "25"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            Under $25
          </button>
          <button
            onClick={() =>
              updateMultipleParams({ minPrice: "25", maxPrice: "50" })
            }
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              currentMinPrice === "25" && currentMaxPrice === "50"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            $25 - $50
          </button>
          <button
            onClick={() =>
              updateMultipleParams({ minPrice: "50", maxPrice: "100" })
            }
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              currentMinPrice === "50" && currentMaxPrice === "100"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            $50 - $100
          </button>
          <button
            onClick={() =>
              updateMultipleParams({ minPrice: "100", maxPrice: "200" })
            }
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              currentMinPrice === "100" && currentMaxPrice === "200"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            $100 - $200
          </button>
          <button
            onClick={() =>
              updateMultipleParams({ minPrice: "200", maxPrice: "" })
            }
            className={`col-span-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              currentMinPrice === "200" && !currentMaxPrice
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            Over $200
          </button>
        </div>
      </div>

      {/* Product Search */}
      <div>
        <h3 className='text-sm font-bold text-gray-900 uppercase tracking-wider mb-4'>
          Search
        </h3>
        <form onSubmit={handleSearchSubmit}>
          <div className='relative'>
            <HiMagnifyingGlass className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder='Search products...'
              className='w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-gray-900 transition-all placeholder-gray-400'
            />
          </div>
        </form>
      </div>
    </div>
  );
}
