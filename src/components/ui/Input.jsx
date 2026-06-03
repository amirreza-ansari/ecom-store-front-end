import { forwardRef } from "react";

const Input = forwardRef(({ label, error, className = "", ...props }, ref) => {
  return (
    <div className={className}>
      {label && (
        <label className='block text-sm font-medium text-[#0F1111] mb-1'>
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent ${
          error ? "border-red-400 bg-red-50" : "border-[#D5D9D9]"
        }`}
        {...props}
      />
      {error && <p className='mt-1 text-xs text-[#B12704]'>{error}</p>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
