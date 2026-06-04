import { useState, useEffect } from "react";
import api from "../../utils/axios";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import {
  HiMagnifyingGlass,
  HiEye,
  HiNoSymbol,
  HiCheck,
  HiTrash,
  HiXMark,
} from "react-icons/hi2";
import toast from "react-hot-toast";
import TableSkeleton from "../../components/ui/TableSkeleton";

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const { data } = await api.get("/users", { params });
      setUsers(data.data.users);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const viewUserDetails = async (userId) => {
    try {
      const { data } = await api.get(`/users/${userId}`);
      setSelectedUser(data.data.user);
    } catch (error) {
      toast.error("Failed to load user details");
    }
  };

  const handleDeactivate = async (userId, userName, isActive) => {
    if (!confirm(`${isActive ? "Deactivate" : "Activate"} "${userName}"?`))
      return;
    setUpdating(true);
    try {
      await api.put(`/users/${userId}/deactivate`);
      toast.success(`User ${isActive ? "deactivated" : "activated"}`);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Permanently delete "${userName}"? This cannot be undone.`))
      return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success("User deleted");
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-bold text-slate-900'>Users</h1>
        <p className='text-slate-500 text-sm mt-1'>
          Manage your platform users and their access levels.
        </p>
      </div>

      <form onSubmit={handleSearch} className='flex gap-2 max-w-md'>
        <input
          type='text'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search by name or email...'
          className='flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-200 outline-none'
        />
        <Button type='submit'>
          <HiMagnifyingGlass className='w-4 h-4' />
        </Button>
      </form>

      <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : users.length === 0 ? (
          <div className='p-12 text-center text-slate-500'>No users found</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm text-left'>
              <thead className='bg-slate-50 text-slate-500 uppercase text-xs font-semibold'>
                <tr>
                  <th className='py-4 px-6'>User</th>
                  <th className='py-4 px-6'>Role</th>
                  <th className='py-4 px-6'>Status</th>
                  <th className='py-4 px-6'>Verification</th>
                  <th className='py-4 px-6'>Joined</th>
                  <th className='py-4 px-6 text-right'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className='hover:bg-slate-50/50 transition-colors'
                  >
                    <td className='py-4 px-6'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 text-xs font-bold'>
                          {user.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className='font-semibold text-slate-900'>
                            {user.name}
                          </p>
                          <p className='text-xs text-slate-500'>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className='py-4 px-6'>
                      <Badge
                        variant={user.role === "admin" ? "warning" : "info"}
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className='py-4 px-6'>
                      <Badge variant={user.isActive ? "success" : "danger"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className='py-4 px-6 text-slate-600 text-xs'>
                      {user.isEmailVerified ? "✅ Verified" : "❌ Pending"}
                    </td>
                    <td className='py-4 px-6 text-slate-500'>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className='py-4 px-6 text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        <button
                          onClick={() => viewUserDetails(user._id)}
                          className='p-2 hover:bg-slate-200 rounded-lg text-slate-500'
                        >
                          <HiEye className='w-4 h-4' />
                        </button>
                        {user.role !== "admin" && (
                          <>
                            <button
                              onClick={() =>
                                handleDeactivate(
                                  user._id,
                                  user.name,
                                  user.isActive,
                                )
                              }
                              className='p-2 hover:bg-slate-200 rounded-lg text-slate-500'
                            >
                              {user.isActive ? (
                                <HiNoSymbol className='w-4 h-4' />
                              ) : (
                                <HiCheck className='w-4 h-4' />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(user._id, user.name)}
                              className='p-2 hover:bg-red-50 rounded-lg text-red-500'
                            >
                              <HiTrash className='w-4 h-4' />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={setPage}
        />
      )}

      {selectedUser && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div
            className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm'
            onClick={() => setSelectedUser(null)}
          />
          <div className='relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8'>
            <button
              onClick={() => setSelectedUser(null)}
              className='absolute top-4 right-4 text-slate-400 hover:text-slate-600'
            >
              <HiXMark className='w-6 h-6' />
            </button>

            <div className='text-center mb-6'>
              <div className='w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-3xl font-bold mx-auto mb-4'>
                {selectedUser.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <h2 className='text-xl font-bold text-slate-900'>
                {selectedUser.name}
              </h2>
              <p className='text-sm text-slate-500'>{selectedUser.email}</p>
            </div>

            <div className='space-y-4 text-sm mb-6'>
              {[
                { label: "Role", value: selectedUser.role, badge: true },
                {
                  label: "Status",
                  value: selectedUser.isActive ? "Active" : "Inactive",
                  badge: true,
                },
                {
                  label: "Verified",
                  value: selectedUser.isEmailVerified ? "Yes" : "No",
                },
                {
                  label: "Joined",
                  value: new Date(selectedUser.createdAt).toLocaleDateString(),
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className='flex justify-between py-2 border-b border-slate-100'
                >
                  <span className='text-slate-500'>{item.label}</span>
                  {item.badge ? (
                    <Badge
                      variant={
                        item.value === "admin" || item.value === "Active"
                          ? "success"
                          : "neutral"
                      }
                    >
                      {item.value}
                    </Badge>
                  ) : (
                    <span className='font-medium'>{item.value}</span>
                  )}
                </div>
              ))}
            </div>

            {selectedUser.role !== "admin" && (
              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  className='flex-1'
                  onClick={() =>
                    handleDeactivate(
                      selectedUser._id,
                      selectedUser.name,
                      selectedUser.isActive,
                    )
                  }
                  disabled={updating}
                >
                  {selectedUser.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant='danger'
                  className='flex-1'
                  onClick={() =>
                    handleDelete(selectedUser._id, selectedUser.name)
                  }
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
