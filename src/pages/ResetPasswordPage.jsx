import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authApi } from "../features/auth/authApi";
import Button from "../components/ui/Button";
import {
  HiLockClosed,
  HiEye,
  HiEyeSlash,
  HiCheck,
  HiShieldCheck,
} from "react-icons/hi2";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordStrength = useMemo(() => {
    let score = 0;
    if (!password) return score;
    if (password.length >= 6) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, { password, confirmPassword });
      setSuccess(true);
      toast.success("Password reset!");
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to reset password. Link may be expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-[70vh] flex items-center justify-center px-4 py-12 bg-white dark:bg-gray-950'>
      <div className='w-full max-w-md'>
        {success ? (
          <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-[#D5D9D9] dark:border-gray-700 p-8 text-center'>
            <div className='w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4'>
              <HiCheck className='w-8 h-8 text-[#067D62] dark:text-green-400' />
            </div>
            <h2 className='text-xl font-bold text-[#0F1111] dark:text-white mb-2'>
              Password Reset!
            </h2>
            <p className='text-sm text-[#565959] dark:text-gray-400 mb-6'>
              You can now sign in with your new password.
            </p>
            <Link to='/'>
              <Button variant='primary' size='lg' className='w-full'>
                Go to Homepage
              </Button>
            </Link>
            <p className='text-xs text-[#565959] dark:text-gray-500 mt-3'>
              Redirecting automatically...
            </p>
          </div>
        ) : (
          <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-[#D5D9D9] dark:border-gray-700 p-8'>
            <div className='text-center mb-6'>
              <div className='w-14 h-14 bg-[#FFF8F0] dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <HiLockClosed className='w-7 h-7 text-[#FF9900]' />
              </div>
              <h1 className='text-xl font-bold text-[#0F1111] dark:text-white'>
                Reset Password
              </h1>
              <p className='text-sm text-[#565959] dark:text-gray-400 mt-1'>
                Enter your new password below
              </p>
            </div>
            {error && (
              <div className='p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-[#B12704] dark:text-red-400 mb-4'>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-[#0F1111] dark:text-gray-300 mb-1.5'>
                  New Password
                </label>
                <div className='relative'>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Enter new password'
                    className='w-full px-4 py-3 text-sm border border-[#D5D9D9] dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9900] pr-10'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-[#565959] dark:text-gray-400 hover:text-[#0F1111] dark:hover:text-white'
                  >
                    {showPassword ? (
                      <HiEyeSlash className='w-4 h-4' />
                    ) : (
                      <HiEye className='w-4 h-4' />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-[#0F1111] dark:text-gray-300 mb-1.5'>
                  Confirm Password
                </label>
                <div className='relative'>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Confirm new password'
                    className='w-full px-4 py-3 text-sm border border-[#D5D9D9] dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9900] pr-10'
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirm(!showConfirm)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-[#565959] dark:text-gray-400 hover:text-[#0F1111] dark:hover:text-white'
                  >
                    {showConfirm ? (
                      <HiEyeSlash className='w-4 h-4' />
                    ) : (
                      <HiEye className='w-4 h-4' />
                    )}
                  </button>
                </div>
              </div>
              {password.length > 0 && (
                <div className='space-y-1'>
                  <div className='flex justify-between'>
                    <p className='text-xs text-[#565959] dark:text-gray-400'>
                      Strength:
                    </p>
                    <p className='text-[10px]'>
                      {["", "Weak", "Fair", "Good", "Strong"][passwordStrength]}
                    </p>
                  </div>
                  <div className='flex gap-1'>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${passwordStrength >= i ? (i <= 2 ? "bg-red-400" : i === 3 ? "bg-yellow-400" : "bg-green-500") : "bg-[#D5D9D9] dark:bg-gray-600"}`}
                      />
                    ))}
                  </div>
                </div>
              )}
              <Button
                type='submit'
                variant='primary'
                size='lg'
                className='w-full mt-2'
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
            <div className='flex items-center justify-center gap-2 mt-4 text-xs text-[#565959] dark:text-gray-400'>
              <HiShieldCheck className='w-4 h-4 text-[#067D62] dark:text-green-400' />{" "}
              Securely encrypted
            </div>
            <div className='text-center mt-6 pt-4 border-t border-[#D5D9D9] dark:border-gray-700'>
              <Link
                to='/'
                className='text-sm text-[#FF9900] hover:underline font-medium'
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
