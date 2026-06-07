import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import { HiHome, HiShoppingBag } from "react-icons/hi2";

export default function NotFoundPage() {
  return (
    <div className='min-h-[80vh] flex items-center justify-center px-4 bg-white dark:bg-gray-950'>
      <div className='text-center max-w-md'>
        <div className='mb-8'>
          <svg viewBox='0 0 400 200' className='w-64 h-32 mx-auto'>
            <text
              x='200'
              y='140'
              textAnchor='middle'
              className='text-8xl font-extrabold'
              fill='#1a1a2e'
              fontWeight='900'
              fontSize='120'
            >
              404
            </text>
            <circle cx='150' cy='60' r='30' fill='#FF9900' opacity='0.1' />
            <circle cx='280' cy='45' r='20' fill='#FF6B6B' opacity='0.1' />
            <rect
              x='80'
              y='20'
              width='40'
              height='6'
              rx='3'
              fill='#FF9900'
              opacity='0.3'
              transform='rotate(-20 80 20)'
            />
            <rect
              x='300'
              y='30'
              width='30'
              height='4'
              rx='2'
              fill='#FF6B6B'
              opacity='0.3'
              transform='rotate(15 300 30)'
            />
          </svg>
        </div>

        <h1 className='text-2xl font-extrabold text-[#0F1111] dark:text-white mb-2'>
          Page Not Found
        </h1>
        <p className='text-[#565959] dark:text-gray-400 mb-8 leading-relaxed'>
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className='flex items-center justify-center gap-3'>
          <Link to='/'>
            <Button variant='primary' size='lg'>
              <HiHome className='w-5 h-5 mr-2' />
              Go Home
            </Button>
          </Link>
          <Link to='/shop'>
            <Button variant='outline' size='lg'>
              <HiShoppingBag className='w-5 h-5 mr-2' />
              Browse Shop
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
