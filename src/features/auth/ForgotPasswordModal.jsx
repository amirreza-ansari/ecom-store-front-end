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
          <div className='w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-2 shadow-inner border border-emerald-100/50'>
            {/* <HiOutlineMail className='w-8 h-8 text-emerald-600' /> */}
            {/* <HiIcons.HiOutlineMail className='w-8 h-8 text-emerald-600' /> */}
            <HiEnvelope className='w-8 h-8 text-emerald-600' />
          </div>
          <div>
            <h3 className='text-xl font-bold text-slate-900 tracking-tight mb-2'>
              Check your inbox
            </h3>
            <p className='text-sm font-medium text-slate-500 leading-relaxed px-4'>
              We've sent password recovery instructions to your email address.
              It might take a few minutes to arrive.
            </p>
          </div>
          <div className='w-full pt-4'>
            <Button
              variant='outline'
              className='w-full py-3 rounded-xl text-sm font-bold border-slate-200 text-slate-700 hover:bg-slate-50 transition-all'
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
          <p className='text-sm font-medium text-slate-500 leading-relaxed'>
            Enter the email address associated with your account and we'll send
            you a link to securely reset your password.
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
              className='w-full py-3.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all disabled:opacity-70'
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
              className='w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors py-2'
            >
              <HiArrowLeft className='w-4 h-4' />
              Back to Sign In
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
