import { useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { authApi } from "./authApi";
import toast from "react-hot-toast";
import { forgotPasswordSchema } from "../../utils/validators";
import { HiEnvelope, HiArrowLeft } from "react-icons/hi2";

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setEmailSent(true);
      toast.success("Recovery instructions sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmailSent(false);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Reset Password'
      size='sm'
    >
      {emailSent ? (
        <div className='flex flex-col items-center justify-center py-6 text-center space-y-4'>
          <div className='w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-2 shadow-inner border border-emerald-100/50 dark:border-emerald-900'>
            <HiEnvelope className='w-8 h-8 text-emerald-600 dark:text-emerald-400' />
          </div>
          <div>
            <h3 className='text-xl font-bold text-slate-900 dark:text-white mb-2'>
              Check your inbox
            </h3>
            <p className='text-sm font-medium text-slate-500 dark:text-gray-400 leading-relaxed px-4'>
              We've sent password recovery instructions to your email address.
            </p>
          </div>
          <div className='w-full pt-4'>
            <Button
              variant='outline'
              className='w-full py-3 rounded-xl text-sm font-bold border-slate-200 dark:border-gray-600 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700'
              onClick={() => {
                handleClose();
                onSwitchToLogin?.();
              }}
            >
              Return to Sign In
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 pt-2'>
          <p className='text-sm font-medium text-slate-500 dark:text-gray-400 leading-relaxed'>
            Enter your email and we'll send you a reset link.
          </p>

          <Input
            label='Email Address'
            type='email'
            placeholder='name@example.com'
            error={errors.email?.message}
            {...register("email", forgotPasswordSchema.email)}
          />

          <div className='space-y-4'>
            <Button
              type='submit'
              variant='primary'
              size='lg'
              className='w-full py-3.5 rounded-xl text-sm font-bold bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-slate-800 dark:hover:bg-gray-200 shadow-lg transition-all disabled:opacity-70'
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
            <button
              type='button'
              onClick={() => {
                handleClose();
                onSwitchToLogin?.();
              }}
              className='w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors py-2'
            >
              <HiArrowLeft className='w-4 h-4' /> Back to Sign In
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
