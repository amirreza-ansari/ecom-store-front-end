import Skeleton from "../../components/ui/Skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className='bg-white rounded-xl overflow-hidden shadow-sm'>
      {/* Image */}
      <Skeleton className='aspect-square w-full rounded-none' />

      {/* Content */}
      <div className='p-4 space-y-3'>
        <Skeleton className='h-3 w-16' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-3/4' />
        <div className='flex items-center gap-1'>
          <Skeleton className='h-3 w-20' />
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-5 w-16' />
          <Skeleton className='h-4 w-12' />
        </div>
      </div>
    </div>
  );
}
