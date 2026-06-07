import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <nav className='flex items-center justify-center gap-1'>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className='p-2 rounded-lg hover:bg-[#F7FAFA] dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
      >
        <HiChevronLeft className='w-5 h-5 text-[#0F1111] dark:text-white' />
      </button>

      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
            page === currentPage
              ? "bg-[#FF9900] text-white"
              : "text-[#0F1111] dark:text-gray-300 hover:bg-[#F7FAFA] dark:hover:bg-gray-700"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className='p-2 rounded-lg hover:bg-[#F7FAFA] dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
      >
        <HiChevronRight className='w-5 h-5 text-[#0F1111] dark:text-white' />
      </button>
    </nav>
  );
}
