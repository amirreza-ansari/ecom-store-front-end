import { useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { loginUser, clearError } from "./authSlice";
import { loginSchema } from "../../utils/validators";

export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
  onSwitchToForgot,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
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
    <Modal isOpen={isOpen} onClose={handleClose} title='Sign In'>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        {error && (
          <div className='p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-[#B12704]'>
            {error}
          </div>
        )}

        <Input
          label='Email'
          type='email'
          placeholder='Enter your email'
          error={errors.email?.message}
          {...register("email", loginSchema.email)}
        />

        <div className='relative'>
          <Input
            label='Password'
            type={showPassword ? "text" : "password"}
            placeholder='Enter your password'
            error={errors.password?.message}
            {...register("password", loginSchema.password)}
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute top-8 right-3 text-xs text-[#565959] hover:text-[#FF9900]'
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className='flex items-center justify-between'>
          <button
            type='button'
            onClick={() => {
              handleClose();
              onSwitchToForgot?.();
            }}
            className='text-sm text-[#FF9900] hover:underline'
          >
            Forgot password?
          </button>
        </div>

        <Button
          type='submit'
          variant='primary'
          size='lg'
          className='w-full'
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        <p className='text-center text-sm text-[#565959]'>
          Don't have an account?{" "}
          <button
            type='button'
            onClick={() => {
              handleClose();
              onSwitchToRegister?.();
            }}
            className='text-[#FF9900] hover:underline font-medium'
          >
            Create one
          </button>
        </p>
      </form>
    </Modal>
  );
}
