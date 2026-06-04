import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchProducts } from "../features/products/productSlice";
import { categoryApi } from "../features/products/categoryApi";
import ProductCard from "../features/products/ProductCard";
import Pagination from "../components/ui/Pagination";
import Spinner from "../components/ui/Spinner";
import {
  HiFunnel,
  HiXMark,
  HiMagnifyingGlass,
  HiChevronRight,
} from "react-icons/hi2";
import ProductCardSkeleton from "../features/products/ProductCardSkeleton";
import { StaggerContainer, StaggerItem } from "../components/ui/StaggerList";

export default function ShopPage() {
  const dispatch = useAppDispatch();
  const { products, pagination, isLoading } = useAppSelector(
    (state) => state.products,
  );
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );

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
  }, [dispatch, searchParams]);

  // Fetch categories
  useEffect(() => {
    categoryApi.getAll().then((res) => setCategories(res.data.data.categories));
  }, []);

  // Update URL params
  const updateParams = useCallback(
    (key, value) => {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      if (key !== "page") newParams.set("page", "1");
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  // Multi-param updater specifically used for applying price ranges cleanly together
  const updateMultipleParams = useCallback(
    (paramsObj) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(paramsObj).forEach(([key, value]) => {
        if (value) {
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

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    updateParams("search", searchInput);
  };

  // Handle page change
  const handlePageChange = (page) => {
    updateParams("page", page.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Clear all active filters
  const clearFilters = () => {
    setSearchInput("");
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
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-gray-900'>
      {/* Title / Info Header */}
      <div className='flex flex-col md:flex-row md:items-baseline justify-between gap-2 border-b border-gray-100 pb-5 mb-8'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-gray-900'>
            {currentFeatured === "true"
              ? "Featured Collection"
              : currentSearch
                ? `Search Results for "${currentSearch}"`
                : "Browse Catalog"}
          </h1>
          {pagination && (
            <p className='mt-2 text-sm text-gray-500'>
              Showing{" "}
              <span className='font-semibold text-gray-800'>
                {products.length}
              </span>{" "}
              of{" "}
              <span className='font-semibold text-gray-800'>
                {pagination.total}
              </span>{" "}
              product
              {pagination.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <div className='flex gap-8 items-start'>
        {/* Filters Sidebar - Desktop */}
        <aside className='hidden lg:block w-64 shrink-0 sticky top-28 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm'>
          <FiltersPanel
            categories={categories}
            currentCategory={currentCategory}
            currentMinPrice={currentMinPrice}
            currentMaxPrice={currentMaxPrice}
            currentInStock={currentInStock}
            currentFeatured={currentFeatured}
            updateParams={updateParams}
            updateMultipleParams={updateMultipleParams}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>

        {/* Main Content Area */}
        <div className='flex-1 w-full'>
          {/* Top Control Bar */}
          <div className='flex items-center justify-between gap-4 bg-gray-50/70 p-3 rounded-xl border border-gray-100 mb-6'>
            {/* Inline Page Search */}
            <form onSubmit={handleSearch} className='flex-1 max-w-md'>
              <div className='relative flex items-center'>
                <HiMagnifyingGlass className='absolute left-3 w-5 h-5 text-gray-400 pointer-events-none' />
                <input
                  type='text'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder='Search within collection...'
                  className='w-full pl-10 pr-24 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]/40 focus:border-[#FF9900] transition-all'
                />
                <button
                  type='submit'
                  className='absolute right-1 px-3 py-1 bg-gray-900 text-white rounded-md text-xs font-medium hover:bg-gray-800 transition-colors'
                >
                  Search
                </button>
              </div>
            </form>

            {/* Sort Dropdown & Mobile Trigger wrapper */}
            <div className='flex items-center gap-2'>
              <select
                value={currentSort}
                onChange={(e) => updateParams("sort", e.target.value)}
                className='px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]/40 focus:border-[#FF9900] transition-all cursor-pointer font-medium text-gray-700'
              >
                <option value=''>Sort by: Featured</option>
                <option value='-createdAt'>Newest Arrivals</option>
                <option value='price'>Price: Low to High</option>
                <option value='-price'>Price: High to Low</option>
                <option value='-ratingsAverage'>Customer Rating</option>
                <option value='name'>Alphabetical: A-Z</option>
              </select>

              {/* Mobile Filter Sheet Trigger Button */}
              <button
                onClick={() => setShowFilters(true)}
                className='lg:hidden flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium'
              >
                <HiFunnel className='w-4 h-4 text-gray-600' />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Active Filter Badge Badges Wrap */}
          {hasActiveFilters && (
            <div className='flex flex-wrap items-center gap-2 mb-6 bg-white p-1 rounded-lg'>
              <span className='text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1'>
                Active:
              </span>
              {currentCategory && (
                <FilterTag
                  label={`${categories.find((c) => c._id === currentCategory)?.name || "Category"}`}
                  onRemove={() => updateParams("category", "")}
                />
              )}
              {currentSearch && (
                <FilterTag
                  label={`"${currentSearch}"`}
                  onRemove={() => {
                    setSearchInput("");
                    updateParams("search", "");
                  }}
                />
              )}
              {currentFeatured === "true" && (
                <FilterTag
                  label='Featured Only'
                  onRemove={() => updateParams("isFeatured", "")}
                />
              )}
              {currentInStock === "true" && (
                <FilterTag
                  label='In Stock'
                  onRemove={() => updateParams("inStock", "")}
                />
              )}
              {(currentMinPrice || currentMaxPrice) && (
                <FilterTag
                  label={`$${currentMinPrice || "0"} - $${currentMaxPrice || "∞"}`}
                  onRemove={() => {
                    updateMultipleParams({ minPrice: "", maxPrice: "" });
                  }}
                />
              )}
              <button
                onClick={clearFilters}
                className='text-xs font-medium text-red-600 hover:text-red-700 hover:underline transition-colors ml-2'
              >
                Reset All
              </button>
            </div>
          )}

          {/* Core Dynamic Loading Grid State */}
          {isLoading ? (
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6'>
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <StaggerContainer>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6'>
                  {products.map((product) => (
                    <StaggerItem key={product._id}>
                      <ProductCard product={product} />
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>

              {/* Pagination System wrapper */}
              {pagination && pagination.pages > 1 && (
                <div className='mt-12 flex justify-center border-t border-gray-100 pt-6'>
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            /* Modern Empty Result State View */
            <div className='text-center py-20 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl max-w-xl mx-auto mt-6'>
              <span className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-2xl mb-4'>
                🔍
              </span>
              <h3 className='text-xl font-bold text-gray-900 mb-1'>
                No matching options found
              </h3>
              <p className='text-gray-500 text-sm max-w-xs mx-auto mb-6'>
                We couldn't find matches for your selection. Try clearing or
                relaxing parameters.
              </p>
              <button
                onClick={clearFilters}
                className='px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 shadow-sm transition-all'
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slide-out Mobile Premium Canvas Filters Drawer Drawer Overlay */}
      {showFilters && (
        <div className='fixed inset-0 z-50 lg:hidden flex justify-end'>
          {/* Translucent Backdrop Blur filter layer mask */}
          <div
            className='fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in'
            onClick={() => setShowFilters(false)}
          />
          {/* Sheet Menu Body Frame */}
          <div className='relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-left overflow-y-auto'>
            <div className='p-6 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-20'>
              <h2 className='text-lg font-bold text-gray-900'>
                Filter Selections
              </h2>
              <button
                type='button'
                onClick={() => setShowFilters(false)}
                className='p-1 rounded-full hover:bg-gray-100 transition-colors'
              >
                <HiXMark className='w-6 h-6 text-gray-500' />
              </button>
            </div>
            <div className='p-6 flex-1'>
              <FiltersPanel
                categories={categories}
                currentCategory={currentCategory}
                currentMinPrice={currentMinPrice}
                currentMaxPrice={currentMaxPrice}
                currentInStock={currentInStock}
                currentFeatured={currentFeatured}
                updateParams={updateParams}
                updateMultipleParams={updateMultipleParams}
                clearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Optimized & High Performance Filter Settings Panel Control Engine
function FiltersPanel({
  categories,
  currentCategory,
  currentMinPrice,
  currentMaxPrice,
  currentInStock,
  currentFeatured,
  updateParams,
  updateMultipleParams,
  clearFilters,
  hasActiveFilters,
}) {
  // Local structural isolation fields to fully eliminate continuous network queries while typing pricing values
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  // Synchronizes local input view bounds if parameters reset globally via clean links
  useEffect(() => {
    setMinPriceInput(currentMinPrice);
    setMaxPriceInput(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  const handlePriceApply = (e) => {
    e.preventDefault();
    updateMultipleParams({
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
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
          className={`group flex items-center justify-between w-full text-left text-sm py-1.5 rounded-lg transition-all ${
            isSelected
              ? "text-[#FF9900] font-semibold"
              : "text-gray-600 hover:text-gray-900 hover:translate-x-0.5"
          }`}
          style={{ paddingLeft: `${level * 12}px` }}
        >
          <span className='flex items-center gap-1.5 truncate'>
            {level > 0 && <span className='text-gray-300 font-light'>└</span>}
            {cat.name}
          </span>
          {isSelected && (
            <span className='w-1.5 h-1.5 rounded-full bg-[#FF9900]' />
          )}
        </button>,
        ...(cat.subcategories?.length > 0
          ? renderCategoryOptions(cat.subcategories, level + 1)
          : []),
      ];
    });
  };

  return (
    <div className='space-y-7'>
      {/* Category Tree Module Section block wrap layout */}
      <div>
        <h3 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-3'>
          Product Category
        </h3>
        <div className='space-y-1 max-h-60 overflow-y-auto pr-1 scrollbar-thin'>
          <button
            type='button'
            onClick={() => updateParams("category", "")}
            className={`flex items-center justify-between w-full text-left text-sm py-1.5 font-medium transition-colors ${
              !currentCategory
                ? "text-[#FF9900] font-semibold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>All Category Items</span>
            {!currentCategory && (
              <span className='w-1.5 h-1.5 rounded-full bg-[#FF9900]' />
            )}
          </button>
          {categories.map((cat) => renderCategoryOptions([cat]))}
        </div>
      </div>

      {/* Isolated Price Bounds Submission Segment Module (Prevents multi-re-fetching bugs) */}
      <div>
        <h3 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-3'>
          Filter Range Price
        </h3>
        <form onSubmit={handlePriceApply} className='space-y-2'>
          <div className='flex items-center gap-2'>
            <div className='relative flex items-center flex-1'>
              <span className='absolute left-2.5 text-xs text-gray-400 font-medium'>
                $
              </span>
              <input
                type='number'
                min='0'
                placeholder='Min'
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className='w-full pl-6 pr-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]/30 focus:border-[#FF9900] transition-all'
              />
            </div>
            <span className='text-gray-300 text-xs font-light'>to</span>
            <div className='relative flex items-center flex-1'>
              <span className='absolute left-2.5 text-xs text-gray-400 font-medium'>
                $
              </span>
              <input
                type='number'
                min='0'
                placeholder='Max'
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className='w-full pl-6 pr-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]/30 focus:border-[#FF9900] transition-all'
              />
            </div>
          </div>
          <button
            type='submit'
            className='w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition-colors shadow-sm'
          >
            Apply Range
          </button>
        </form>
      </div>

      {/* Quick Boolean Filter Action Box Segment Block */}
      <div>
        <h3 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-3'>
          Availability Status
        </h3>
        <div className='space-y-2.5'>
          <label className='flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer group'>
            <input
              type='checkbox'
              checked={currentInStock === "true"}
              onChange={(e) =>
                updateParams("inStock", e.target.checked ? "true" : "")
              }
              className='w-4 h-4 text-[#FF9900] border-gray-300 rounded focus:ring-[#FF9900] transition-all cursor-pointer'
            />
            <span>In Stock Units Only</span>
          </label>
          <label className='flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer group'>
            <input
              type='checkbox'
              checked={currentFeatured === "true"}
              onChange={(e) =>
                updateParams("isFeatured", e.target.checked ? "true" : "")
              }
              className='w-4 h-4 text-[#FF9900] border-gray-300 rounded focus:ring-[#FF9900] transition-all cursor-pointer'
            />
            <span>Staff Handpicked Items</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// Refactored active filter pill badge item layout display unit structure
function FilterTag({ label, onRemove }) {
  return (
    <span className='inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-gray-100 hover:bg-gray-200/80 rounded-full text-xs font-medium text-gray-700 transition-colors'>
      <span>{label}</span>
      <button
        type='button'
        onClick={onRemove}
        className='p-0.5 rounded-full hover:bg-gray-300 text-gray-400 hover:text-gray-700 transition-colors'
      >
        <HiXMark className='w-3.5 h-3.5' />
      </button>
    </span>
  );
}
