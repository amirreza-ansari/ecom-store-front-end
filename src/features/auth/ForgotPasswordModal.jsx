import { useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { authApi } from "./authApi";
import toast from "react-hot-toast";
import { forgotPasswordSchema } from "../../utils/validators";

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
      toast.success("Reset link sent to your email");
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
    <Modal isOpen={isOpen} onClose={handleClose} title='Forgot Password'>
      {emailSent ? (
        <div className='text-center py-4'>
          <div className='text-5xl mb-4'>📧</div>
          <h3 className='text-lg font-semibold text-[#0F1111] mb-2'>
            Check your email
          </h3>
          <p className='text-sm text-[#565959] mb-6'>
            We've sent a password reset link to your email address.
          </p>
          <Button
            variant='primary'
            onClick={() => {
              handleClose();
              onSwitchToLogin?.();
            }}
          >
            Back to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <p className='text-sm text-[#565959]'>
            Enter your email and we'll send you a link to reset your password.
          </p>

          <Input
            label='Email'
            type='email'
            placeholder='Enter your email'
            error={errors.email?.message}
            {...register("email", forgotPasswordSchema.email)}
          />

          <Button
            type='submit'
            variant='primary'
            size='lg'
            className='w-full'
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>

          <p className='text-center text-sm text-[#565959]'>
            <button
              type='button'
              onClick={() => {
                handleClose();
                onSwitchToLogin?.();
              }}
              className='text-[#FF9900] hover:underline font-medium'
            >
              Back to Sign In
            </button>
          </p>
        </form>
      )}
    </Modal>
  );
}
