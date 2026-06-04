import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { productApi } from "../../features/products/productApi";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Fetch results on typing
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
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
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

  const handleSelect = (product) => {
    setQuery("");
    setIsOpen(false);
    navigate(`/product/${product.slug}`);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const highlightMatch = (text) => {
    if (!query.trim()) return text;
    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className='text-[#FF9900] font-medium'>
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  };

  return (
    <div className='relative flex-1 max-w-2xl mx-4' ref={dropdownRef}>
      <form onSubmit={handleSubmit} className='flex'>
        <input
          ref={inputRef}
          type='text'
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder='Search products...'
          className='w-full px-4 py-2 text-sm text-white placeholder-white border border-[#D5D9D9] rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent'
        />
        <button
          type='submit'
          className='px-4 py-2 bg-[#FF9900] text-white rounded-r-lg hover:bg-[#E88B00] transition-colors'
        >
          <HiMagnifyingGlass className='w-5 h-5' />
        </button>
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div className='absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-[#D5D9D9] overflow-hidden z-50'>
          {isLoading ? (
            <div className='p-4 text-center text-sm text-[#565959]'>
              <div className='w-5 h-5 border-2 border-[#D5D9D9] border-t-[#FF9900] rounded-full animate-spin mx-auto mb-2' />
              Searching...
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((product, index) => (
                <button
                  key={product._id}
                  onClick={() => handleSelect(product)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F7FAFA] transition-colors ${
                    index === selectedIndex ? "bg-[#F7FAFA]" : ""
                  }`}
                >
                  {/* Product image */}
                  <img
                    src={
                      product.images?.[0]?.url ||
                      "https://via.placeholder.com/40x40?text=No+Image"
                    }
                    alt={product.name}
                    className='w-10 h-10 object-cover rounded'
                  />

                  <div className='flex-1 min-w-0'>
                    <p className='text-sm text-[#0F1111] truncate'>
                      {highlightMatch(product.name)}
                    </p>
                    <p className='text-xs text-[#565959]'>
                      {product.brand || "Generic"}
                    </p>
                  </div>

                  <span className='text-sm font-bold text-[#0F1111]'>
                    ${product.price}
                  </span>
                </button>
              ))}

              {/* See all results */}
              <Link
                to={`/shop?search=${encodeURIComponent(query.trim())}`}
                onClick={() => {
                  setQuery("");
                  setIsOpen(false);
                }}
                className='block w-full text-center px-4 py-3 text-sm text-[#FF9900] hover:bg-[#F7FAFA] border-t border-[#D5D9D9] font-medium transition-colors'
              >
                See all results for "{query}"
              </Link>
            </>
          ) : (
            <p className='p-4 text-center text-sm text-[#565959]'>
              No products found for "{query}"
            </p>
          )}
        </div>
      )}
    </div>
  );
}
