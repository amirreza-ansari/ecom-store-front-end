import { useState, useEffect } from "react";
import { useAppDispatch } from "../app/hooks";
import { addressApi } from "../features/users/addressApi";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { HiPlus, HiPencil, HiTrash, HiMapPin, HiCheck } from "react-icons/hi2";
import toast from "react-hot-toast";

const emptyAddress = {
  label: "Home",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "US",
  phone: "",
  isDefault: false,
};

export default function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyAddress);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { data } = await addressApi.getAll();
      setAddresses(data.data.addresses || []);
    } catch (error) {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (addr) => {
    setEditingId(addr._id);
    setForm({
      label: addr.label,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
      phone: addr.phone || "",
      isDefault: addr.isDefault,
    });
    setShowForm(true);
    setFormError("");
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm(emptyAddress);
    setShowForm(true);
    setFormError("");
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyAddress);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.street.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.zipCode.trim()
    ) {
      setFormError("Please fill in all required fields");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (editingId) {
        await addressApi.update(editingId, form);
        toast.success("Address updated");
      } else {
        await addressApi.add(form);
        toast.success("Address added");
      }
      await fetchAddresses();
      handleCancel();
    } catch (error) {
      setFormError(error.response?.data?.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!confirm("Delete this address?")) return;
    try {
      await addressApi.delete(addressId);
      setAddresses((prev) => prev.filter((a) => a._id !== addressId));
      toast.success("Address deleted");
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Spinner size='lg' />
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto px-4 py-6'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold text-[#0F1111]'>My Addresses</h1>
        {!showForm && (
          <Button onClick={handleAdd} size='sm'>
            <HiPlus className='w-4 h-4 mr-1' /> Add Address
          </Button>
        )}
      </div>

      {/* Address Form */}
      {showForm && (
        <div className='bg-white rounded-lg p-6 shadow-sm mb-6'>
          <h2 className='text-lg font-semibold text-[#0F1111] mb-4'>
            {editingId ? "Edit Address" : "New Address"}
          </h2>

          {formError && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-[#B12704] mb-4'>
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-[#0F1111] mb-1'>
                  Label
                </label>
                <select
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className='w-full px-3 py-2.5 text-sm border border-[#D5D9D9] rounded-lg'
                >
                  <option>Home</option>
                  <option>Work</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-[#0F1111] mb-1'>
                  Phone
                </label>
                <input
                  type='text'
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder='Optional'
                  className='w-full px-4 py-2.5 text-sm border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-[#0F1111] mb-1'>
                Street *
              </label>
              <input
                type='text'
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                required
                className='w-full px-4 py-2.5 text-sm border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]'
              />
            </div>

            <div className='grid grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-[#0F1111] mb-1'>
                  City *
                </label>
                <input
                  type='text'
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                  className='w-full px-4 py-2.5 text-sm border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-[#0F1111] mb-1'>
                  State *
                </label>
                <input
                  type='text'
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  required
                  className='w-full px-4 py-2.5 text-sm border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-[#0F1111] mb-1'>
                  Zip Code *
                </label>
                <input
                  type='text'
                  value={form.zipCode}
                  onChange={(e) =>
                    setForm({ ...form, zipCode: e.target.value })
                  }
                  required
                  className='w-full px-4 py-2.5 text-sm border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]'
                />
              </div>
            </div>

            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={form.isDefault}
                onChange={(e) =>
                  setForm({ ...form, isDefault: e.target.checked })
                }
                className='w-4 h-4 text-[#FF9900] focus:ring-[#FF9900] rounded'
              />
              <span className='text-sm text-[#0F1111]'>
                Set as default address
              </span>
            </label>

            <div className='flex gap-3'>
              <Button type='submit' variant='primary' disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Address"
                    : "Save Address"}
              </Button>
              <Button type='button' variant='outline' onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {!showForm && addresses.length === 0 ? (
        <div className='text-center py-16 bg-white rounded-lg shadow-sm'>
          <HiMapPin className='w-16 h-16 text-[#D5D9D9] mx-auto mb-4' />
          <h2 className='text-lg font-semibold text-[#0F1111] mb-2'>
            No addresses yet
          </h2>
          <p className='text-[#565959] mb-6'>
            Add a shipping address to make checkout faster.
          </p>
          <Button onClick={handleAdd}>
            <HiPlus className='w-4 h-4 mr-1' /> Add Address
          </Button>
        </div>
      ) : (
        !showForm && (
          <div className='space-y-4'>
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className='bg-white rounded-lg p-5 shadow-sm border border-[#D5D9D9]'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='font-medium text-[#0F1111]'>
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className='inline-flex items-center gap-1 text-xs bg-green-50 text-[#067D62] px-2 py-0.5 rounded-full'>
                          <HiCheck className='w-3 h-3' /> Default
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-[#565959]'>
                      {addr.street}
                      <br />
                      {addr.city}, {addr.state} {addr.zipCode}
                      <br />
                      {addr.country}
                    </p>
                    {addr.phone && (
                      <p className='text-sm text-[#565959] mt-1'>
                        📱 {addr.phone}
                      </p>
                    )}
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleEdit(addr)}
                      className='p-2 text-[#565959] hover:text-[#FF9900] hover:bg-[#F7FAFA] rounded-lg transition-colors'
                      title='Edit'
                    >
                      <HiPencil className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleDelete(addr._id)}
                      className='p-2 text-[#565959] hover:text-[#B12704] hover:bg-[#F7FAFA] rounded-lg transition-colors'
                      title='Delete'
                    >
                      <HiTrash className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
