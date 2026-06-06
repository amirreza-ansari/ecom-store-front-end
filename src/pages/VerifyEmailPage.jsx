import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { authApi } from "../features/auth/authApi";
import Button from "../components/ui/Button";
import { HiCheck, HiXCircle, HiArrowRight } from "react-icons/hi2";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!verifiedRef.current) {
      verifiedRef.current = true;
      verifyEmail();
    }
  }, []);

  const verifyEmail = async () => {
    try {
      const { data } = await authApi.verifyEmail(token);
      setStatus("success");
      setMessage(data.message || "Email verified successfully!");
    } catch (error) {
      // Only show error if not already verified
      if (status !== "success") {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Verification failed. Link may be expired.",
        );
      }
    }
  };

  return (
    <div className='min-h-[70vh] flex items-center justify-center px-4 py-12'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-2xl shadow-sm border border-[#D5D9D9] p-8 text-center'>
          {/* Icon */}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              status === "verifying"
                ? "bg-[#FFF8F0]"
                : status === "success"
                  ? "bg-green-100"
                  : "bg-red-100"
            }`}
          >
            {status === "verifying" && (
              <div className='w-8 h-8 border-2 border-[#D5D9D9] border-t-[#FF9900] rounded-full animate-spin' />
            )}
            {status === "success" && (
              <HiCheck className='w-8 h-8 text-[#067D62]' />
            )}
            {status === "error" && (
              <HiXCircle className='w-8 h-8 text-[#B12704]' />
            )}
          </div>

          {/* Title */}
          <h1 className='text-xl font-bold text-[#0F1111] mb-2'>
            {status === "verifying" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </h1>

          {/* Message */}
          <p className='text-sm text-[#565959] mb-6'>
            {status === "verifying" &&
              "Please wait while we verify your email address."}
            {status === "success" && message}
            {status === "error" && message}
          </p>

          {/* Action */}
          {status === "success" && (
            <Link to='/'>
              <Button variant='primary' size='lg'>
                Start Shopping <HiArrowRight className='w-4 h-4 ml-2' />
              </Button>
            </Link>
          )}

          {status === "error" && (
            <div className='space-y-3'>
              <button
                onClick={verifyEmail}
                className='w-full px-4 py-3 bg-[#FF9900] text-white font-medium rounded-xl hover:bg-[#E88B00] transition-colors'
              >
                Try Again
              </button>
              <Link
                to='/'
                className='block text-sm text-[#FF9900] hover:underline'
              >
                ← Back to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
