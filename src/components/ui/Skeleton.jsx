export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`bg-gradient-to-r from-[#D5D9D9] via-[#EAEDED] to-[#D5D9D9] bg-[length:200%_100%] animate-shimmer rounded ${className}`}
    />
  );
}
