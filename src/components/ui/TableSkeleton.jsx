import Skeleton from "./Skeleton";

export default function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className='space-y-3 p-4'>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className='flex gap-4'>
          {[...Array(cols)].map((_, j) => (
            <Skeleton
              key={j}
              className={`h-8 flex-1 ${j === 0 ? "flex-[2]" : ""}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
