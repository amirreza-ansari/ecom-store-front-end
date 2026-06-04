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

  // Smarter password strength calculation
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
      await authApi.resetPassword(token, {
        password,
        confirmPassword,
      });
      setSuccess(true);
      toast.success("Password reset successful!");
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
    <div className='min-h-[70vh] flex items-center justify-center px-4 py-12'>
      <div className='w-full max-w-md'>
        {success ? (
          /* Success State */
          <div className='bg-white rounded-2xl shadow-sm border border-[#D5D9D9] p-8 text-center animate-fade-in'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <HiCheck className='w-8 h-8 text-[#067D62]' />
            </div>
            <h2 className='text-xl font-bold text-[#0F1111] mb-2'>
              Password Reset!
            </h2>
            <p className='text-sm text-[#565959] mb-6'>
              Your password has been successfully reset. You can now sign in
              with your new password.
            </p>
            <Link to='/'>
              <Button variant='primary' size='lg' className='w-full'>
                Go to Homepage
              </Button>
            </Link>
            <p className='text-xs text-[#565959] mt-3'>
              Redirecting automatically...
            </p>
          </div>
        ) : (
          /* Reset Form */
          <div className='bg-white rounded-2xl shadow-sm border border-[#D5D9D9] p-8'>
            {/* Header */}
            <div className='text-center mb-6'>
              <div className='w-14 h-14 bg-[#FFF8F0] rounded-full flex items-center justify-center mx-auto mb-4'>
                <HiLockClosed className='w-7 h-7 text-[#FF9900]' />
              </div>
              <h1 className='text-xl font-bold text-[#0F1111]'>
                Reset Password
              </h1>
              <p className='text-sm text-[#565959] mt-1'>
                Enter your new password below
              </p>
            </div>

            {error && (
              <div className='p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-[#B12704] mb-4'>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* New Password */}
              <div>
                <label
                  htmlFor='new-password'
                  className='block text-sm font-medium text-[#0F1111] mb-1.5'
                >
                  New Password
                </label>
                <div className='relative'>
                  <input
                    id='new-password'
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Enter new password'
                    className='w-full px-4 py-3 text-sm border border-[#D5D9D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent pr-10'
                    autoComplete='new-password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-[#565959] hover:text-[#0F1111] transition-colors'
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <HiEyeSlash className='w-4 h-4' />
                    ) : (
                      <HiEye className='w-4 h-4' />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor='confirm-password'
                  className='block text-sm font-medium text-[#0F1111] mb-1.5'
                >
                  Confirm Password
                </label>
                <div className='relative'>
                  <input
                    id='confirm-password'
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Confirm new password'
                    className='w-full px-4 py-3 text-sm border border-[#D5D9D9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent pr-10'
                    autoComplete='new-password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirm(!showConfirm)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-[#565959] hover:text-[#0F1111] transition-colors'
                    aria-label={
                      showConfirm
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirm ? (
                      <HiEyeSlash className='w-4 h-4' />
                    ) : (
                      <HiEye className='w-4 h-4' />
                    )}
                  </button>
                </div>
              </div>

              {/* Dynamic Password Strength */}
              {password.length > 0 && (
                <div className='space-y-1'>
                  <div className='flex justify-between items-center'>
                    <p className='text-xs text-[#565959]'>Password strength:</p>
                    <p className='text-[10px] text-[#565959]'>
                      {passwordStrength === 1 && "Weak"}
                      {passwordStrength === 2 && "Fair"}
                      {passwordStrength === 3 && "Good"}
                      {passwordStrength === 4 && "Strong"}
                    </p>
                  </div>
                  <div className='flex gap-1 transition-all duration-300'>
                    <div
                      className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength >= 1 ? "bg-red-400" : "bg-[#D5D9D9]"}`}
                    />
                    <div
                      className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength >= 2 ? "bg-yellow-400" : "bg-[#D5D9D9]"}`}
                    />
                    <div
                      className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength >= 3 ? "bg-green-400" : "bg-[#D5D9D9]"}`}
                    />
                    <div
                      className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength >= 4 ? "bg-green-500" : "bg-[#D5D9D9]"}`}
                    />
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

            {/* Security Note */}
            <div className='flex items-center justify-center gap-2 mt-4 text-xs text-[#565959]'>
              <HiShieldCheck className='w-4 h-4 text-[#067D62]' />
              Your password is securely encrypted
            </div>

            <div className='text-center mt-6 pt-4 border-t border-[#D5D9D9]'>
              <Link
                to='/'
                className='text-sm text-[#FF9900] hover:underline font-medium'
              >
                &larr; Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
