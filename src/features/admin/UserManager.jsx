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
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-[#0F1111]'>Users</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className='flex gap-2 max-w-md'>
        <input
          type='text'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search by name or email...'
          className='flex-1 px-4 py-2 text-sm border border-[#D5D9D9] rounded-lg'
        />
        <Button type='submit' size='sm'>
          <HiMagnifyingGlass className='w-4 h-4' />
        </Button>
      </form>

      {/* Users Table */}
      <div className='bg-white rounded-lg shadow-sm border overflow-x-auto'>
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : users.length === 0 ? (
          <div className='p-8 text-center text-[#565959]'>No users found</div>
        ) : (
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-[#D5D9D9] bg-[#F7FAFA]'>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  User
                </th>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Role
                </th>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Status
                </th>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Verified
                </th>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Joined
                </th>
                <th className='text-right py-3 px-4 font-medium text-[#565959]'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className='border-b border-[#D5D9D9] hover:bg-[#F7FAFA]'
                >
                  <td className='py-3 px-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-[#FF9900] rounded-full flex items-center justify-center text-white text-sm font-bold'>
                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className='font-medium text-[#0F1111]'>
                          {user.name}
                        </p>
                        <p className='text-xs text-[#565959]'>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className='py-3 px-4'>
                    <Badge variant={user.role === "admin" ? "warning" : "info"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className='py-3 px-4'>
                    <Badge variant={user.isActive ? "success" : "danger"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className='py-3 px-4'>
                    {user.isEmailVerified ? (
                      <span className='text-[#067D62] text-xs'>
                        ✅ Verified
                      </span>
                    ) : (
                      <span className='text-[#565959] text-xs'>
                        ❌ Not verified
                      </span>
                    )}
                  </td>
                  <td className='py-3 px-4 text-[#565959] text-xs'>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className='py-3 px-4 text-right'>
                    <div className='flex items-center justify-end gap-1'>
                      <button
                        onClick={() => viewUserDetails(user._id)}
                        className='p-1.5 hover:bg-[#F7FAFA] rounded text-[#FF9900]'
                        title='View'
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
                            className='p-1.5 hover:bg-[#F7FAFA] rounded text-[#FF9900]'
                            title={user.isActive ? "Deactivate" : "Activate"}
                          >
                            {user.isActive ? (
                              <HiNoSymbol className='w-4 h-4' />
                            ) : (
                              <HiCheck className='w-4 h-4' />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id, user.name)}
                            className='p-1.5 hover:bg-[#F7FAFA] rounded text-[#B12704]'
                            title='Delete'
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
        )}
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={setPage}
        />
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div
            className='fixed inset-0 bg-black/50'
            onClick={() => setSelectedUser(null)}
          />
          <div className='relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6'>
            <div className='text-center mb-4'>
              <div className='w-16 h-16 bg-[#FF9900] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3'>
                {selectedUser.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <h2 className='text-lg font-bold'>{selectedUser.name}</h2>
              <p className='text-sm text-[#565959]'>{selectedUser.email}</p>
            </div>

            <div className='space-y-3 text-sm'>
              <div className='flex justify-between py-2 border-b'>
                <span className='text-[#565959]'>Role</span>
                <Badge
                  variant={selectedUser.role === "admin" ? "warning" : "info"}
                >
                  {selectedUser.role}
                </Badge>
              </div>
              <div className='flex justify-between py-2 border-b'>
                <span className='text-[#565959]'>Status</span>
                <Badge variant={selectedUser.isActive ? "success" : "danger"}>
                  {selectedUser.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className='flex justify-between py-2 border-b'>
                <span className='text-[#565959]'>Email Verified</span>
                <span>{selectedUser.isEmailVerified ? "✅ Yes" : "❌ No"}</span>
              </div>
              <div className='flex justify-between py-2 border-b'>
                <span className='text-[#565959]'>Joined</span>
                <span>
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className='flex justify-between py-2 border-b'>
                <span className='text-[#565959]'>User ID</span>
                <span className='text-xs font-mono'>{selectedUser._id}</span>
              </div>
            </div>

            {selectedUser.role !== "admin" && (
              <div className='flex gap-2 mt-4'>
                <Button
                  variant='outline'
                  size='sm'
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
                  size='sm'
                  className='flex-1'
                  onClick={() =>
                    handleDelete(selectedUser._id, selectedUser.name)
                  }
                >
                  Delete
                </Button>
              </div>
            )}

            <div className='mt-4'>
              <Button
                variant='outline'
                size='sm'
                className='w-full'
                onClick={() => setSelectedUser(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
