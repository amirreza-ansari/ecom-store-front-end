import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchProducts } from "../features/products/productSlice";
import { categoryApi } from "../features/products/categoryApi";
import ProductCard from "../features/products/ProductCard";
import Pagination from "../components/ui/Pagination";
import Spinner from "../components/ui/Spinner";
import { HiFunnel, HiXMark, HiMagnifyingGlass } from "react-icons/hi2";

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

  // Current filter values
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

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    updateParams("search", searchInput);
  };

  // Handle page change
  const handlePageChange = (page) => {
    updateParams("page", page.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Clear all filters
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
    <div className='max-w-7xl mx-auto px-4 py-6'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-[#0F1111] mb-2'>
          {currentFeatured === "true"
            ? "Featured Products"
            : currentSearch
              ? `Results for "${currentSearch}"`
              : "All Products"}
        </h1>
        {pagination && (
          <p className='text-sm text-[#565959]'>
            {pagination.total} product{pagination.total !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      <div className='flex gap-6'>
        {/* Filters Sidebar - Desktop */}
        <aside className='hidden lg:block w-64 shrink-0'>
          <FiltersPanel
            categories={categories}
            currentCategory={currentCategory}
            currentSort={currentSort}
            currentMinPrice={currentMinPrice}
            currentMaxPrice={currentMaxPrice}
            currentInStock={currentInStock}
            currentFeatured={currentFeatured}
            updateParams={updateParams}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>

        {/* Main Content */}
        <div className='flex-1'>
          {/* Search & Sort Bar */}
          <div className='flex items-center gap-4 mb-6'>
            {/* Search */}
            <form onSubmit={handleSearch} className='flex-1 max-w-md'>
              <div className='flex'>
                <input
                  type='text'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder='Search products...'
                  className='w-full px-4 py-2 text-sm border border-[#D5D9D9] rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent'
                />
                <button
                  type='submit'
                  className='px-4 py-2 bg-[#FF9900] text-white rounded-r-lg hover:bg-[#E88B00]'
                >
                  <HiMagnifyingGlass className='w-5 h-5' />
                </button>
              </div>
            </form>

            {/* Sort */}
            <select
              value={currentSort}
              onChange={(e) => updateParams("sort", e.target.value)}
              className='px-3 py-2 text-sm border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]'
            >
              <option value=''>Sort by: Default</option>
              <option value='-createdAt'>Newest</option>
              <option value='price'>Price: Low to High</option>
              <option value='-price'>Price: High to Low</option>
              <option value='-ratingsAverage'>Top Rated</option>
              <option value='name'>Name: A-Z</option>
            </select>

            {/* Mobile filter button */}
            <button
              onClick={() => setShowFilters(true)}
              className='lg:hidden p-2 border border-[#D5D9D9] rounded-lg hover:bg-[#F7FAFA]'
            >
              <HiFunnel className='w-5 h-5' />
            </button>
          </div>

          {/* Active filter tags */}
          {hasActiveFilters && (
            <div className='flex flex-wrap gap-2 mb-4'>
              {currentCategory && (
                <FilterTag
                  label={`Category: ${categories.find((c) => c._id === currentCategory)?.name || currentCategory}`}
                  onRemove={() => updateParams("category", "")}
                />
              )}
              {currentSearch && (
                <FilterTag
                  label={`Search: "${currentSearch}"`}
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
                  label='In Stock Only'
                  onRemove={() => updateParams("inStock", "")}
                />
              )}
              {(currentMinPrice || currentMaxPrice) && (
                <FilterTag
                  label={`Price: $${currentMinPrice || "0"} - $${currentMaxPrice || "∞"}`}
                  onRemove={() => {
                    updateParams("minPrice", "");
                    updateParams("maxPrice", "");
                  }}
                />
              )}
              <button
                onClick={clearFilters}
                className='text-xs text-[#B12704] hover:underline'
              >
                Clear all
              </button>
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {[...Array(6)].map((_, i) => (
                <div key={i} className='bg-white rounded-lg p-4 animate-pulse'>
                  <div className='aspect-square bg-[#D5D9D9] rounded-lg mb-4' />
                  <div className='h-4 bg-[#D5D9D9] rounded w-3/4 mb-2' />
                  <div className='h-4 bg-[#D5D9D9] rounded w-1/2' />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className='mt-8'>
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className='text-center py-16'>
              <div className='text-6xl mb-4'>🔍</div>
              <h3 className='text-lg font-semibold text-[#0F1111] mb-2'>
                No products found
              </h3>
              <p className='text-[#565959] mb-4'>
                Try adjusting your search or filters
              </p>
              <button
                onClick={clearFilters}
                className='text-[#FF9900] hover:underline font-medium'
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className='fixed inset-0 z-50 lg:hidden'>
          <div
            className='fixed inset-0 bg-black/50'
            onClick={() => setShowFilters(false)}
          />
          <div className='fixed inset-y-0 right-0 w-80 bg-white shadow-2xl overflow-auto'>
            <div className='p-4'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-lg font-bold'>Filters</h2>
                <button onClick={() => setShowFilters(false)}>
                  <HiXMark className='w-6 h-6' />
                </button>
              </div>
              <FiltersPanel
                categories={categories}
                currentCategory={currentCategory}
                currentSort={currentSort}
                currentMinPrice={currentMinPrice}
                currentMaxPrice={currentMaxPrice}
                currentInStock={currentInStock}
                currentFeatured={currentFeatured}
                updateParams={updateParams}
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

// Filters Panel Component
function FiltersPanel({
  categories,
  currentCategory,
  currentSort,
  currentMinPrice,
  currentMaxPrice,
  currentInStock,
  currentFeatured,
  updateParams,
  clearFilters,
  hasActiveFilters,
}) {
  return (
    <div className='space-y-6'>
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className='text-sm text-[#B12704] hover:underline font-medium'
        >
          Clear all filters
        </button>
      )}

      {/* Categories */}
      <div>
        <h3 className='text-sm font-bold text-[#0F1111] mb-3 uppercase'>
          Category
        </h3>
        <div className='space-y-1'>
          <button
            onClick={() => updateParams("category", "")}
            className={`block w-full text-left text-sm px-2 py-1.5 rounded ${!currentCategory ? "bg-[#FF9900] text-white font-medium" : "text-[#0F1111] hover:bg-[#F7FAFA]"}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => updateParams("category", cat._id)}
              className={`block w-full text-left text-sm px-2 py-1.5 rounded ${currentCategory === cat._id ? "bg-[#FF9900] text-white font-medium" : "text-[#0F1111] hover:bg-[#F7FAFA]"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className='text-sm font-bold text-[#0F1111] mb-3 uppercase'>
          Price Range
        </h3>
        <div className='flex gap-2'>
          <input
            type='number'
            placeholder='Min'
            value={currentMinPrice}
            onChange={(e) => updateParams("minPrice", e.target.value)}
            className='w-full px-2 py-1.5 text-sm border border-[#D5D9D9] rounded focus:outline-none focus:ring-2 focus:ring-[#FF9900]'
          />
          <span className='text-[#565959]'>-</span>
          <input
            type='number'
            placeholder='Max'
            value={currentMaxPrice}
            onChange={(e) => updateParams("maxPrice", e.target.value)}
            className='w-full px-2 py-1.5 text-sm border border-[#D5D9D9] rounded focus:outline-none focus:ring-2 focus:ring-[#FF9900]'
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div>
        <h3 className='text-sm font-bold text-[#0F1111] mb-3 uppercase'>
          Quick Filters
        </h3>
        <div className='space-y-2'>
          <label className='flex items-center gap-2 text-sm cursor-pointer'>
            <input
              type='checkbox'
              checked={currentInStock === "true"}
              onChange={(e) =>
                updateParams("inStock", e.target.checked ? "true" : "")
              }
              className='w-4 h-4 text-[#FF9900] focus:ring-[#FF9900] rounded'
            />
            In Stock Only
          </label>
          <label className='flex items-center gap-2 text-sm cursor-pointer'>
            <input
              type='checkbox'
              checked={currentFeatured === "true"}
              onChange={(e) =>
                updateParams("isFeatured", e.target.checked ? "true" : "")
              }
              className='w-4 h-4 text-[#FF9900] focus:ring-[#FF9900] rounded'
            />
            Featured Only
          </label>
        </div>
      </div>
    </div>
  );
}

// Filter Tag Component
function FilterTag({ label, onRemove }) {
  return (
    <span className='inline-flex items-center gap-1 px-2.5 py-1 bg-[#F7FAFA] border border-[#D5D9D9] rounded-full text-xs text-[#0F1111]'>
      {label}
      <button onClick={onRemove} className='hover:text-[#B12704]'>
        <HiXMark className='w-3 h-3' />
      </button>
    </span>
  );
}
