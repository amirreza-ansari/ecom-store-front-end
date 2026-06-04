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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Create Account'
      size='sm'
    >
      <div className='mb-6'>
        <p className='text-sm text-slate-500'>
          Join us to streamline your shopping experience.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        {error && (
          <div className='p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl text-sm font-medium text-rose-600 flex items-center gap-2'>
            <div className='w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0'></div>
            {error}
          </div>
        )}

        <Input
          label='Full Name'
          type='text'
          placeholder='Nastaran Heidari'
          error={errors.name?.message}
          {...register("name", registerSchema.name)}
        />

        <Input
          label='Email Address'
          type='email'
          placeholder='name@example.com'
          error={errors.email?.message}
          {...register("email", registerSchema.email)}
        />

        <div className='relative'>
          <Input
            label='Password'
            type={showPassword ? "text" : "password"}
            placeholder='Create a secure password'
            error={errors.password?.message}
            {...register("password", registerSchema.password)}
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute top-[34px] right-3 text-[11px] font-bold tracking-wide uppercase text-slate-400 hover:text-slate-900 transition-colors bg-white px-1'
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
            className='absolute top-[34px] right-3 text-[11px] font-bold tracking-wide uppercase text-slate-400 hover:text-slate-900 transition-colors bg-white px-1'
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>

        {/* Polished Password Strength Indicator */}
        {password && (
          <div className='space-y-1.5 pt-1'>
            <div className='flex gap-1.5 h-1.5'>
              <div
                className={`flex-1 rounded-full transition-all duration-300 ${password.length >= 1 ? "bg-rose-400" : "bg-slate-100"}`}
              />
              <div
                className={`flex-1 rounded-full transition-all duration-300 ${password.length >= 4 ? "bg-amber-400" : "bg-slate-100"}`}
              />
              <div
                className={`flex-1 rounded-full transition-all duration-300 ${password.length >= 6 ? "bg-emerald-400" : "bg-slate-100"}`}
              />
              <div
                className={`flex-1 rounded-full transition-all duration-300 ${password.length >= 8 ? "bg-emerald-600" : "bg-slate-100"}`}
              />
            </div>
            <p className='text-[10px] font-medium text-slate-400 text-right uppercase tracking-wider'>
              {password.length < 4
                ? "Weak"
                : password.length < 8
                  ? "Good"
                  : "Strong"}
            </p>
          </div>
        )}

        <div className='pt-2'>
          <Button
            type='submit'
            variant='primary'
            size='lg'
            className='w-full py-3.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all disabled:opacity-70'
            disabled={isLoading}
          >
            {isLoading ? "Setting up..." : "Create Account"}
          </Button>
        </div>

        <div className='space-y-4 pt-2'>
          <p className='text-center text-[11px] font-medium text-slate-400 leading-relaxed px-4'>
            By continuing, you agree to our{" "}
            <span className='text-slate-700 underline cursor-pointer'>
              Terms of Service
            </span>{" "}
            and{" "}
            <span className='text-slate-700 underline cursor-pointer'>
              Privacy Policy
            </span>
            .
          </p>

          <p className='text-center text-sm font-medium text-slate-500 border-t border-slate-100 pt-4'>
            Already have an account?{" "}
            <button
              type='button'
              onClick={() => {
                handleClose();
                onSwitchToLogin?.();
              }}
              className='text-slate-900 font-bold hover:underline decoration-2 underline-offset-2'
            >
              Sign In
            </button>
          </p>
        </div>
      </form>
    </Modal>
  );
}
