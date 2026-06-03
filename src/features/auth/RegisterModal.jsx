import { useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { registerUser, clearError } from "./authSlice";
import { registerSchema } from "../../utils/validators";

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const password = watch("password", "");

  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;
    const result = await dispatch(registerUser(userData));
    if (result.meta.requestStatus === "fulfilled") {
      reset();
      onClose();
    }
  };

  const handleClose = () => {
    dispatch(clearError());
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title='Create Account'>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        {error && (
          <div className='p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-[#B12704]'>
            {error}
          </div>
        )}

        <Input
          label='Full Name'
          type='text'
          placeholder='Enter your full name'
          error={errors.name?.message}
          {...register("name", registerSchema.name)}
        />

        <Input
          label='Email'
          type='email'
          placeholder='Enter your email'
          error={errors.email?.message}
          {...register("email", registerSchema.email)}
        />

        <div className='relative'>
          <Input
            label='Password'
            type={showPassword ? "text" : "password"}
            placeholder='Create a password'
            error={errors.password?.message}
            {...register("password", registerSchema.password)}
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute top-8 right-3 text-xs text-[#565959] hover:text-[#FF9900]'
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className='relative'>
          <Input
            label='Confirm Password'
            type={showConfirm ? "text" : "password"}
            placeholder='Confirm your password'
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              ...registerSchema.confirmPassword,
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
          />
          <button
            type='button'
            onClick={() => setShowConfirm(!showConfirm)}
            className='absolute top-8 right-3 text-xs text-[#565959] hover:text-[#FF9900]'
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>

        {password && (
          <div className='space-y-1'>
            <p className='text-xs text-[#565959]'>Password strength:</p>
            <div className='flex gap-1'>
              <div
                className={`h-1 flex-1 rounded ${password.length >= 1 ? "bg-red-400" : "bg-[#D5D9D9]"}`}
              />
              <div
                className={`h-1 flex-1 rounded ${password.length >= 4 ? "bg-yellow-400" : "bg-[#D5D9D9]"}`}
              />
              <div
                className={`h-1 flex-1 rounded ${password.length >= 6 ? "bg-green-400" : "bg-[#D5D9D9]"}`}
              />
              <div
                className={`h-1 flex-1 rounded ${password.length >= 8 ? "bg-green-500" : "bg-[#D5D9D9]"}`}
              />
            </div>
          </div>
        )}

        <p className='text-xs text-[#565959]'>
          By creating an account, you agree to our Terms of Service and Privacy
          Policy.
        </p>

        <Button
          type='submit'
          variant='primary'
          size='lg'
          className='w-full'
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>

        <p className='text-center text-sm text-[#565959]'>
          Already have an account?{" "}
          <button
            type='button'
            onClick={() => {
              handleClose();
              onSwitchToLogin?.();
            }}
            className='text-[#FF9900] hover:underline font-medium'
          >
            Sign In
          </button>
        </p>
      </form>
    </Modal>
  );
}
