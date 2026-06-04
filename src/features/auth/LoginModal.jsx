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
    <Modal isOpen={isOpen} onClose={handleClose} title='Welcome Back' size='sm'>
      <div className='mb-6'>
        <p className='text-sm text-slate-500'>
          Enter your credentials to access your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
        {error && (
          <div className='p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl text-sm font-medium text-rose-600 flex items-center gap-2'>
            <div className='w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0'></div>
            {error}
          </div>
        )}

        <div className='space-y-4'>
          <Input
            label='Email Address'
            type='email'
            placeholder='name@example.com'
            error={errors.email?.message}
            {...register("email", loginSchema.email)}
          />

          <div className='relative'>
            <Input
              label='Password'
              type={showPassword ? "text" : "password"}
              placeholder='••••••••'
              error={errors.password?.message}
              {...register("password", loginSchema.password)}
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute top-[34px] right-3 text-[11px] font-bold tracking-wide uppercase text-slate-400 hover:text-slate-900 transition-colors bg-white px-1'
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className='flex items-center justify-end'>
          <button
            type='button'
            onClick={() => {
              handleClose();
              onSwitchToForgot?.();
            }}
            className='text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors'
          >
            Forgot your password?
          </button>
        </div>

        <Button
          type='submit'
          variant='primary'
          size='lg'
          className='w-full py-3.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all disabled:opacity-70'
          disabled={isLoading}
        >
          {isLoading ? "Authenticating..." : "Sign In"}
        </Button>

        <p className='text-center text-sm font-medium text-slate-500 pt-2'>
          Don't have an account?{" "}
          <button
            type='button'
            onClick={() => {
              handleClose();
              onSwitchToRegister?.();
            }}
            className='text-slate-900 font-bold hover:underline decoration-2 underline-offset-2'
          >
            Create one
          </button>
        </p>
      </form>
    </Modal>
  );
}
