import { HiBars3, HiUser, HiArrowRightOnRectangle } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logoutUser } from "../../features/auth/authSlice";

export default function AdminHeader({ onMenuClick }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  return (
    <header className='bg-white border-b border-[#D5D9D9] px-4 py-3 flex items-center justify-between sticky top-0 z-30'>
      <button
        onClick={onMenuClick}
        className='lg:hidden p-2 hover:bg-[#F7FAFA] rounded-lg'
      >
        <HiBars3 className='w-5 h-5' />
      </button>

      <h1 className='text-lg font-semibold text-[#0F1111] hidden sm:block'>
        Admin Panel
      </h1>

      <div className='flex items-center gap-3 ml-auto'>
        <div className='flex items-center gap-2 text-sm'>
          <div className='w-8 h-8 bg-[#FF9900] rounded-full flex items-center justify-center text-white font-bold'>
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <span className='text-[#0F1111] hidden sm:inline'>
            {user?.name || "Admin"}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className='p-2 text-[#565959] hover:text-[#B12704] hover:bg-[#F7FAFA] rounded-lg transition-colors'
          title='Sign Out'
        >
          <HiArrowRightOnRectangle className='w-5 h-5' />
        </button>
      </div>
    </header>
  );
}
