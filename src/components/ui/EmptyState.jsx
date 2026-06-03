import { Link } from "react-router-dom";
import Button from "./Button";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
}) {
  return (
    <div className='flex flex-col items-center justify-center py-16 px-4'>
      {Icon && <Icon className='w-20 h-20 text-[#D5D9D9] mb-4' />}
      <h2 className='text-xl font-semibold text-[#0F1111] mb-2'>{title}</h2>
      <p className='text-[#565959] text-center max-w-md mb-6'>{description}</p>
      {actionLabel && actionTo && (
        <Button to={actionTo} variant='primary'>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
