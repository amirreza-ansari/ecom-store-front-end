import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminRoute from "../shared/AdminRoute";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminRoute>
      <div className='flex h-screen bg-[#F7FAFA]'>
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className='flex-1 flex flex-col overflow-hidden'>
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className='flex-1 overflow-y-auto p-4 lg:p-6'>
            <Outlet />
          </main>
        </div>
      </div>
    </AdminRoute>
  );
}
