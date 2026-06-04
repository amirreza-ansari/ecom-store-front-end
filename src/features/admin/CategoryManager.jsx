import { useState, useEffect } from "react";
import { categoryApi } from "../products/categoryApi";
import api from "../../utils/axios";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiFolder,
  HiFolderOpen,
} from "react-icons/hi2";
import toast from "react-hot-toast";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    parent: "",
    isActive: true,
  });
  const [parentCategories, setParentCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await categoryApi.getAll();
      setCategories(data.data.categories || []);
      setParentCategories(data.data.categories || []);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setForm({
      name: cat.name || "",
      description: cat.description || "",
      parent: cat.parent || "",
      isActive: cat.isActive !== false,
    });
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm({ name: "", description: "", parent: "", isActive: true });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // Update: include isActive
        await api.put(`/categories/${editingId}`, {
          name: form.name,
          description: form.description,
          parent: form.parent || null,
          isActive: form.isActive,
        });
        toast.success("Category updated");
      } else {
        // Create: don't send isActive
        await api.post("/categories", {
          name: form.name,
          description: form.description,
          parent: form.parent || null,
        });
        toast.success("Category created");
      }
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // const handleDelete = async (catId, catName) => {
  //   if (!confirm(`Delete "${catName}"?`)) return;
  //   try {
  //     await api.delete(`/categories/${catId}`);
  //     toast.success("Category deleted");
  //     fetchCategories();
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || "Failed to delete");
  //   }
  // };
  const handleDelete = async (catId, catName) => {
    if (!confirm(`Delete "${catName}"?`)) return;
    try {
      await api.delete(`/categories/${catId}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const renderCategoryOptions = (cats, level = 0) => {
    return cats.flatMap((cat) => [
      <option key={cat._id} value={cat._id}>
        {"— ".repeat(level)}
        {cat.name}
      </option>,
      ...(cat.subcategories?.length > 0
        ? renderCategoryOptions(cat.subcategories, level + 1)
        : []),
    ]);
  };

  const renderCategory = (cat, level = 0) => (
    <div key={cat._id}>
      <div
        className='flex items-center justify-between py-3 px-4 hover:bg-[#F7FAFA] border-b border-[#D5D9D9]'
        style={{ paddingLeft: `${16 + level * 24}px` }}
      >
        <div className='flex items-center gap-3'>
          {cat.subcategories?.length > 0 ? (
            <HiFolderOpen className='w-5 h-5 text-[#FF9900]' />
          ) : (
            <HiFolder className='w-5 h-5 text-[#565959]' />
          )}
          <div>
            <p className='font-medium text-[#0F1111]'>{cat.name}</p>
            {cat.description && (
              <p className='text-xs text-[#565959]'>{cat.description}</p>
            )}
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <Badge variant={cat.isActive ? "success" : "neutral"}>
            {cat.isActive ? "Active" : "Inactive"}
          </Badge>
          <span className='text-xs text-[#565959]'>
            {cat.subcategories?.length || 0} sub
          </span>
          <div className='flex gap-1'>
            <button
              onClick={() => handleEdit(cat)}
              className='p-1.5 hover:bg-white rounded text-[#FF9900]'
            >
              <HiPencil className='w-4 h-4' />
            </button>
            <button
              onClick={() => handleDelete(cat._id, cat.name)}
              className='p-1.5 hover:bg-white rounded text-[#B12704]'
            >
              <HiTrash className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>
      {/* Subcategories */}
      {cat.subcategories?.map((sub) => renderCategory(sub, level + 1))}
    </div>
  );

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-[#0F1111]'>Categories</h1>
        <Button onClick={handleAdd} size='sm'>
          <HiPlus className='w-4 h-4 mr-1' /> Add Category
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div
            className='fixed inset-0 bg-black/50'
            onClick={() => setShowForm(false)}
          />
          <div className='relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6'>
            <h2 className='text-lg font-bold mb-4'>
              {editingId ? "Edit Category" : "New Category"}
            </h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Name *</label>
                <input
                  type='text'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                  className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Parent Category
                </label>
                <select
                  value={form.parent}
                  onChange={(e) => setForm({ ...form, parent: e.target.value })}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                >
                  <option value=''>None (Top Level)</option>
                  {parentCategories
                    .filter((c) => c._id !== editingId)
                    .map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
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

      {/* Categories List */}
      <div className='bg-white rounded-lg shadow-sm border'>
        {loading ? (
          <div className='p-8 flex justify-center'>
            <Spinner />
          </div>
        ) : categories.length === 0 ? (
          <div className='p-8 text-center text-[#565959]'>
            No categories found
          </div>
        ) : (
          categories.map((cat) => renderCategory(cat))
        )}
      </div>
    </div>
  );
}
