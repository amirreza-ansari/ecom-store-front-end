import Skeleton from "../../components/ui/Skeleton";

export default function OrderCardSkeleton() {
  return (
    <div className='bg-white rounded-lg p-5 border border-[#D5D9D9] space-y-3'>
      <div className='flex justify-between'>
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-5 w-20' />
      </div>
      <Skeleton className='h-4 w-48' />
      <div className='flex justify-between items-center'>
        <Skeleton className='h-6 w-20' />
        <Skeleton className='h-4 w-24' />
      </div>
    </div>
  );
}
