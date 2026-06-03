import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import Spinner from "../ui/Spinner";

export default function AdminRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAppSelector(
    (state) => state.auth,
  );

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Spinner size='lg' />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  if (user?.role !== "admin") {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh]'>
        <h1 className='text-6xl font-bold text-[#0F1111] mb-4'>403</h1>
        <p className='text-lg text-[#565959] mb-6'>
          You don't have permission to access this page.
        </p>
        <a href='/' className='text-[#FF9900] hover:underline font-medium'>
          Go to Home
        </a>
      </div>
    );
  }

  return children;
}
