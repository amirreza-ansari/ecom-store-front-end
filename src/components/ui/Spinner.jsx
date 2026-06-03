export default function Spinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizes[size]} border-2 border-[#D5D9D9] border-t-[#FF9900] rounded-full animate-spin`}
      />
    </div>
  );
}
