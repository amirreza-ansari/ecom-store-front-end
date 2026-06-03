import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import Spinner from "../ui/Spinner";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const token = localStorage.getItem("accessToken");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Give the auth check time to complete
    const timer = setTimeout(() => {
      setChecking(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // If we have a token and still checking/loading, show spinner
  if (token && (checking || isLoading)) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Spinner size='lg' />
      </div>
    );
  }

  // No token or auth failed
  if (!isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  return children;
}
