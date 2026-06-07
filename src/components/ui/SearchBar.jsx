import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HiMagnifyingGlass, HiXMark } from "react-icons/hi2";
import { productApi } from "../../features/products/productApi";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await productApi.getAll({ search: query, limit: 5 });
        setResults(data.data.products);
        setIsOpen(true);
      } catch (error) {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setIsOpen(false);
    }
  };

  return (
    <div className='relative w-full' ref={dropdownRef}>
      <form
        onSubmit={handleSubmit}
        className='flex items-center bg-[#F0F0F0] dark:bg-gray-700 rounded-full px-4 py-2.5 focus-within:ring-2 focus-within:ring-[#FF4500] transition-all'
      >
        <HiMagnifyingGlass className='w-5 h-5 text-gray-500 dark:text-gray-400 mr-2' />
        <input
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search for products...'
          className='w-full bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none'
        />
        {query && (
          <button
            type='button'
            onClick={() => setQuery("")}
            className='text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white'
          >
            <HiXMark className='w-5 h-5' />
          </button>
        )}
      </form>

      {isOpen && (
        <div className='absolute top-full left-0 right-0 mt-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50'>
          {isLoading ? (
            <div className='p-6 text-center text-sm text-gray-500 dark:text-gray-400'>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className='py-2'>
              {results.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product.slug}`}
                  onClick={() => {
                    setQuery("");
                    setIsOpen(false);
                  }}
                  className='flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                >
                  <img
                    src={product.images?.[0]?.url || "/placeholder.jpg"}
                    alt={product.name}
                    className='w-12 h-12 object-cover rounded-md'
                  />
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                      {product.name}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      {product.brand}
                    </p>
                  </div>
                  <span className='text-sm font-bold text-black dark:text-white'>
                    ${product.price}
                  </span>
                </Link>
              ))}
              <Link
                to={`/shop?search=${encodeURIComponent(query.trim())}`}
                onClick={() => setIsOpen(false)}
                className='block text-center py-3 text-sm font-semibold text-[#FF4500] hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-50 dark:border-gray-700'
              >
                View all results
              </Link>
            </div>
          ) : (
            <div className='p-6 text-center text-sm text-gray-500 dark:text-gray-400'>
              No products found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
