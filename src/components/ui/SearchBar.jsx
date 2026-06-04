import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiMagnifyingGlass } from "react-icons/hi2";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className='flex-1 max-w-2xl mx-4'>
      <div className='flex'>
        <input
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search products...'
          className='w-full px-4 py-2 text-sm border border-[#D5D9D9] rounded-l-lg text-white placeholder-white  focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent'
        />
        <button
          type='submit'
          className='px-4 py-2 bg-[#FF9900] text-white rounded-r-lg hover:bg-[#E88B00] transition-colors'
        >
          <HiMagnifyingGlass className='w-5 h-5' />
        </button>
      </div>
    </form>
  );
}
