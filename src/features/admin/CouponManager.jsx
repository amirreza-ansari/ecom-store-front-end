import { useState, useEffect } from "react";
import api from "../../utils/axios";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import { HiPlus, HiPencil, HiTrash, HiEye, HiTicket } from "react-icons/hi2";
import toast from "react-hot-toast";

const discountTypeColors = {
  percentage: "info",
  fixed: "warning",
  free_shipping: "success",
};

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const emptyForm = {
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    maxDiscount: "",
    minPurchase: "",
    usageLimit: "",
    perUserLimit: 1,
    endDate: "",
    isActive: true,
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchCoupons();
  }, [page]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/coupons", {
        params: { page, limit: 10 },
      });
      setCoupons(data.data.coupons);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code || "",
      description: coupon.description || "",
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue || "",
      maxDiscount: coupon.maxDiscount || "",
      minPurchase: coupon.minPurchase || "",
      usageLimit: coupon.usageLimit || "",
      perUserLimit: coupon.perUserLimit || 1,
      endDate: coupon.endDate
        ? new Date(coupon.endDate).toISOString().slice(0, 10)
        : "",
      isActive: coupon.isActive !== false,
    });
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    try {
      if (editingId) {
        // Update: don't send code
        const payload = {
          description: form.description,
          discountType: form.discountType,
          discountValue:
            form.discountType !== "free_shipping"
              ? Number(form.discountValue)
              : undefined,
          maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
          minPurchase: Number(form.minPurchase) || 0,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
          perUserLimit: Number(form.perUserLimit) || 1,
          endDate: form.endDate || null,
          isActive: form.isActive,
        };
        await api.put(`/coupons/${editingId}`, payload);
        toast.success("Coupon updated");
      } else {
        // Create: require code
        if (!form.code.trim()) {
          toast.error("Coupon code is required");
          setSaving(false);
          return;
        }
        const payload = {
          code: form.code.toUpperCase().trim(),
          description: form.description,
          discountType: form.discountType,
          discountValue:
            form.discountType !== "free_shipping"
              ? Number(form.discountValue)
              : undefined,
          maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
          minPurchase: Number(form.minPurchase) || 0,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
          perUserLimit: Number(form.perUserLimit) || 1,
          endDate: form.endDate || null,
          isActive: form.isActive,
        };
        await api.post("/coupons", payload);
        toast.success("Coupon created");
      }
      setShowForm(false);
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (couponId, code) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${couponId}`);
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const viewStats = async (couponId) => {
    try {
      const { data } = await api.get(`/coupons/${couponId}/stats`);
      setSelectedCoupon(data.data.stats);
    } catch (error) {
      toast.error("Failed to load stats");
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-[#0F1111]'>Coupons</h1>
        <Button onClick={handleAdd} size='sm'>
          <HiPlus className='w-4 h-4 mr-1' /> Add Coupon
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div
            className='fixed inset-0 bg-black/50'
            onClick={() => setShowForm(false)}
          />
          <div className='relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto p-6'>
            <h2 className='text-lg font-bold mb-4'>
              {editingId ? "Edit Coupon" : "New Coupon"}
            </h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Code *
                  </label>
                  <input
                    type='text'
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className='w-full px-3 py-2 text-sm border rounded-lg uppercase'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) =>
                      setForm({ ...form, discountType: e.target.value })
                    }
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  >
                    <option value='percentage'>Percentage</option>
                    <option value='fixed'>Fixed Amount</option>
                    <option value='free_shipping'>Free Shipping</option>
                  </select>
                </div>
                {form.discountType !== "free_shipping" && (
                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      {form.discountType === "percentage"
                        ? "Discount %"
                        : "Amount ($)"}
                    </label>
                    <input
                      type='number'
                      value={form.discountValue}
                      onChange={(e) =>
                        setForm({ ...form, discountValue: e.target.value })
                      }
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                )}
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Max Discount ($)
                  </label>
                  <input
                    type='number'
                    value={form.maxDiscount}
                    onChange={(e) =>
                      setForm({ ...form, maxDiscount: e.target.value })
                    }
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Min Purchase ($)
                  </label>
                  <input
                    type='number'
                    value={form.minPurchase}
                    onChange={(e) =>
                      setForm({ ...form, minPurchase: e.target.value })
                    }
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Usage Limit
                  </label>
                  <input
                    type='number'
                    value={form.usageLimit}
                    onChange={(e) =>
                      setForm({ ...form, usageLimit: e.target.value })
                    }
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                    placeholder='Unlimited'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Per User Limit
                  </label>
                  <input
                    type='number'
                    value={form.perUserLimit}
                    onChange={(e) =>
                      setForm({ ...form, perUserLimit: e.target.value })
                    }
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                    min='1'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Expiry Date
                  </label>
                  <input
                    type='date'
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Description
                </label>
                <input
                  type='text'
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
              </div>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className='w-4 h-4 text-[#FF9900] rounded'
                />
                <span className='text-sm'>Active</span>
              </label>
              <div className='flex gap-3'>
                <Button type='submit' disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className='bg-white rounded-lg shadow-sm border overflow-x-auto'>
        {loading ? (
          <div className='p-8 flex justify-center'>
            <Spinner />
          </div>
        ) : coupons.length === 0 ? (
          <div className='p-8 text-center text-[#565959]'>No coupons found</div>
        ) : (
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-[#D5D9D9] bg-[#F7FAFA]'>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Code
                </th>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Type
                </th>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Value
                </th>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Used
                </th>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Status
                </th>
                <th className='text-right py-3 px-4 font-medium text-[#565959]'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr
                  key={coupon._id}
                  className='border-b border-[#D5D9D9] hover:bg-[#F7FAFA]'
                >
                  <td className='py-3 px-4'>
                    <div className='flex items-center gap-2'>
                      <HiTicket className='w-5 h-5 text-[#FF9900]' />
                      <span className='font-bold text-[#0F1111]'>
                        {coupon.code}
                      </span>
                    </div>
                  </td>
                  <td className='py-3 px-4'>
                    <Badge
                      variant={
                        discountTypeColors[coupon.discountType] || "neutral"
                      }
                    >
                      {coupon.discountType.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className='py-3 px-4 font-medium'>
                    {coupon.discountType === "free_shipping"
                      ? "Free Ship"
                      : coupon.discountType === "percentage"
                        ? `${coupon.discountValue}%`
                        : `$${coupon.discountValue}`}
                  </td>
                  <td className='py-3 px-4'>
                    {coupon.usedCount || 0}
                    {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                  </td>
                  <td className='py-3 px-4'>
                    <Badge variant={coupon.isActive ? "success" : "neutral"}>
                      {coupon.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className='py-3 px-4 text-right'>
                    <div className='flex items-center justify-end gap-1'>
                      <button
                        onClick={() => viewStats(coupon._id)}
                        className='p-1.5 hover:bg-[#F7FAFA] rounded text-[#FF9900]'
                        title='Stats'
                      >
                        <HiEye className='w-4 h-4' />
                      </button>
                      <button
                        onClick={() => handleEdit(coupon)}
                        className='p-1.5 hover:bg-[#F7FAFA] rounded text-[#FF9900]'
                        title='Edit'
                      >
                        <HiPencil className='w-4 h-4' />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id, coupon.code)}
                        className='p-1.5 hover:bg-[#F7FAFA] rounded text-[#B12704]'
                        title='Delete'
                      >
                        <HiTrash className='w-4 h-4' />
                      </button>
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

      {/* Stats Modal */}
      {selectedCoupon && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div
            className='fixed inset-0 bg-black/50'
            onClick={() => setSelectedCoupon(null)}
          />
          <div className='relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6'>
            <div className='text-center mb-4'>
              <HiTicket className='w-12 h-12 text-[#FF9900] mx-auto mb-2' />
              <h2 className='text-xl font-bold'>{selectedCoupon.code}</h2>
            </div>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between py-2 border-b'>
                <span className='text-[#565959]'>Used Count</span>
                <span className='font-bold'>{selectedCoupon.usedCount}</span>
              </div>
              <div className='flex justify-between py-2 border-b'>
                <span className='text-[#565959]'>Usage Limit</span>
                <span>{selectedCoupon.usageLimit || "Unlimited"}</span>
              </div>
              <div className='flex justify-between py-2 border-b'>
                <span className='text-[#565959]'>Remaining</span>
                <span className='font-bold text-[#067D62]'>
                  {selectedCoupon.remaining}
                </span>
              </div>
              <div className='flex justify-between py-2 border-b'>
                <span className='text-[#565959]'>Unique Users</span>
                <span>{selectedCoupon.uniqueUsers}</span>
              </div>
              {selectedCoupon.users?.length > 0 && (
                <div>
                  <p className='text-[#565959] mb-2'>Recent Users:</p>
                  {selectedCoupon.users.slice(0, 5).map((u, i) => (
                    <div key={i} className='flex justify-between text-xs py-1'>
                      <span>{u.name}</span>
                      <span className='text-[#565959]'>
                        {new Date(u.usedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant='outline'
              size='sm'
              className='w-full mt-4'
              onClick={() => setSelectedCoupon(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
