import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function CustomerLayout() {
  return (
    <div className='min-h-screen flex flex-col bg-[#EAEDED] dark:bg-gray-950'>
      <Header />
      <main className='flex-1'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
