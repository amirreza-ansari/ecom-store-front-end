import { useEffect } from "react";
import { HiXMark } from "react-icons/hi2";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='fixed inset-0 bg-black/50' onClick={onClose} />
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-auto`}
      >
        <div className='flex items-center justify-between p-4 border-b border-[#D5D9D9] dark:border-gray-700'>
          <h2 className='text-lg font-semibold text-[#0F1111] dark:text-white'>
            {title}
          </h2>
          <button
            onClick={onClose}
            className='p-1 hover:bg-[#F7FAFA] dark:hover:bg-gray-700 rounded-lg transition-colors'
          >
            <HiXMark className='w-5 h-5 text-[#565959] dark:text-gray-400' />
          </button>
        </div>
        <div className='p-4'>{children}</div>
      </div>
    </div>
  );
}
