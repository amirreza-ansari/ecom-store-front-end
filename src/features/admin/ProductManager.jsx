import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productApi } from "../products/productApi";
import { categoryApi } from "../products/categoryApi";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import { HiPlus, HiPencil, HiTrash, HiMagnifyingGlass } from "react-icons/hi2";
import toast from "react-hot-toast";
import { HiArrowUpTray, HiXMark } from "react-icons/hi2";
import api from "../../utils/axios";
import TableSkeleton from "../../components/ui/TableSkeleton";

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  const emptyProduct = {
    name: "",
    description: "",
    price: "",
    comparePrice: "",
    brand: "",
    category: "",
    stock: "",
    tags: "",
    isFeatured: false,
  };

  const [form, setForm] = useState(emptyProduct);

  useEffect(() => {
    fetchProducts();
    categoryApi.getAll().then((res) => setCategories(res.data.data.categories));
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const { data } = await productApi.getAll(params);
      setProducts(data.data.products);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
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

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      comparePrice: product.comparePrice || "",
      brand: product.brand || "",
      category: product.category?._id || product.category || "",
      stock: product.stock || "",
      tags: product.tags?.join(", ") || "",
      isFeatured: product.isFeatured || false,
    });
    setExistingImages(product.images || []);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm(emptyProduct);
    setImageFiles([]);
    setExistingImages([]);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      toast.error("Name, price, and category are required");
      return;
    }

    setSaving(true);
    try {
      const productData = {
        ...form,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        stock: Number(form.stock) || 0,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      let productId;

      if (editingId) {
        await api.put(`/products/${editingId}`, productData);
        productId = editingId;
        toast.success("Product updated");
      } else {
        const { data } = await api.post("/products", productData);
        productId = data.data.product._id;
        toast.success("Product created");
      }

      // Upload images if there are files selected
      if (imageFiles.length > 0 && productId) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append("images", file));

        try {
          await api.post(`/products/${productId}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Images uploaded successfully!");
        } catch (error) {
          toast.error("Product created but image upload failed");
        }
      }

      setShowForm(false);
      setImageFiles([]);
      setExistingImages([]);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!confirm(`Delete "${productName}"?`)) return;
    try {
      const api = (await import("../../utils/axios")).default;
      await api.delete(`/products/${productId}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleImageUpload = async (productId) => {
    if (imageFiles.length === 0) return;

    setUploadingImages(true);
    const formData = new FormData();
    imageFiles.forEach((file) => formData.append("images", file));

    try {
      await api.post(`/products/${productId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Images uploaded!");
      setImageFiles([]);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (productId, imageId) => {
    if (!confirm("Delete this image?")) return;
    try {
      await api.delete(`/products/${productId}/images/${imageId}`);
      toast.success("Image deleted");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-[#0F1111]'>Products</h1>
        <Button onClick={handleAdd} size='sm'>
          <HiPlus className='w-4 h-4 mr-1' /> Add Product
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className='flex gap-2 max-w-md'>
        <input
          type='text'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search products...'
          className='flex-1 px-4 py-2 text-sm border border-[#D5D9D9] rounded-lg'
        />
        <Button type='submit' size='sm'>
          <HiMagnifyingGlass className='w-4 h-4' />
        </Button>
      </form>

      {/* Form Modal */}
      {showForm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div
            className='fixed inset-0 bg-black/50'
            onClick={() => setShowForm(false)}
          />
          <div className='relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6'>
            <h2 className='text-lg font-bold mb-4'>
              {editingId ? "Edit Product" : "New Product"}
            </h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='col-span-2'>
                  <label className='block text-sm font-medium mb-1'>
                    Name *
                  </label>
                  <input
                    type='text'
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                    required
                  />
                </div>
                <div className='col-span-2'>
                  <label className='block text-sm font-medium mb-1'>
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={3}
                    className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Price *
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Compare Price
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    value={form.comparePrice}
                    onChange={(e) =>
                      setForm({ ...form, comparePrice: e.target.value })
                    }
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Brand
                  </label>
                  <input
                    type='text'
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                    required
                  >
                    <option value=''>Select category</option>
                    {categories.map((cat) => renderCategoryOptions([cat]))}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Stock
                  </label>
                  <input
                    type='number'
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Tags (comma separated)
                  </label>
                  <input
                    type='text'
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder='phone, apple, 5g'
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
              </div>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={form.isFeatured}
                  onChange={(e) =>
                    setForm({ ...form, isFeatured: e.target.checked })
                  }
                  className='w-4 h-4 text-[#FF9900] rounded'
                />
                <span className='text-sm'>Featured product</span>
              </label>
              {/* Image Upload Section */}
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Product Images
                </label>

                {/* Existing images (edit mode only) */}
                {editingId && existingImages.length > 0 && (
                  <div className='flex gap-2 flex-wrap mb-3'>
                    {existingImages.map((img) => (
                      <div key={img._id} className='relative w-20 h-20 group'>
                        <img
                          src={img.url}
                          alt=''
                          className='w-full h-full object-cover rounded-lg'
                        />
                        <button
                          type='button'
                          onClick={() => handleDeleteImage(editingId, img._id)}
                          className='absolute -top-1 -right-1 bg-[#B12704] text-white rounded-full w-5 h-5 items-center justify-center text-xs hidden group-hover:flex'
                        >
                          <HiXMark className='w-3 h-3' />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* File input - behaves differently for add vs edit */}
                <label
                  className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    uploadingImages
                      ? "border-[#FF9900] bg-[#FFF8F0]"
                      : "border-[#D5D9D9] hover:border-[#FF9900] hover:bg-[#F7FAFA]"
                  }`}
                >
                  {uploadingImages ? (
                    <>
                      <div className='w-4 h-4 border-2 border-[#D5D9D9] border-t-[#FF9900] rounded-full animate-spin' />
                      <span className='text-sm text-[#565959]'>
                        Uploading...
                      </span>
                    </>
                  ) : (
                    <>
                      <HiArrowUpTray className='w-4 h-4 text-[#565959]' />
                      <span className='text-sm text-[#565959]'>
                        {editingId
                          ? "Click to add more images (auto-upload)"
                          : imageFiles.length > 0
                            ? `${imageFiles.length} file(s) selected`
                            : "Click to select images"}
                      </span>
                    </>
                  )}
                  <input
                    type='file'
                    multiple
                    accept='image/*'
                    className='hidden'
                    onChange={async (e) => {
                      const files = Array.from(e.target.files);
                      if (files.length === 0) return;

                      if (editingId) {
                        // Edit mode: upload immediately
                        setUploadingImages(true);
                        const formData = new FormData();
                        files.forEach((file) =>
                          formData.append("images", file),
                        );
                        try {
                          const { data } = await api.post(
                            `/products/${editingId}/images`,
                            formData,
                            {
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            },
                          );
                          setExistingImages(data.data.images);
                          await fetchProducts();
                          toast.success(`${files.length} image(s) uploaded!`);
                        } catch (error) {
                          toast.error("Upload failed");
                        } finally {
                          setUploadingImages(false);
                        }
                      } else {
                        // Add mode: save files for later upload after product creation
                        setImageFiles(files);
                      }
                    }}
                  />
                </label>
                {!editingId && imageFiles.length > 0 && (
                  <p className='text-xs text-[#FF9900] mt-1'>
                    Images will be uploaded after you save
                  </p>
                )}
              </div>
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

      {/* Products Table */}
      <div className='bg-white rounded-lg shadow-sm border overflow-x-auto'>
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : (
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-[#D5D9D9] bg-[#F7FAFA]'>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Product
                </th>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Price
                </th>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Stock
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
              {products.map((product) => (
                <tr
                  key={product._id}
                  className='border-b border-[#D5D9D9] hover:bg-[#F7FAFA]'
                >
                  <td className='py-3 px-4'>
                    <div className='flex items-center gap-3'>
                      <img
                        src={
                          product.images?.[0]?.url ||
                          "https://via.placeholder.com/40x40"
                        }
                        alt=''
                        className='w-10 h-10 object-cover rounded'
                      />
                      <div>
                        <p className='font-medium text-[#0F1111]'>
                          {product.name}
                        </p>
                        <p className='text-xs text-[#565959]'>
                          {product.brand || "No brand"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='py-3 px-4 font-medium'>
                    ${product.price?.toFixed(2)}
                  </td>
                  <td className='py-3 px-4'>
                    <span
                      className={
                        product.stock === 0
                          ? "text-[#B12704]"
                          : product.stock <= 10
                            ? "text-[#FF9900]"
                            : ""
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className='py-3 px-4'>
                    {product.isActive ? (
                      <Badge variant='success'>Active</Badge>
                    ) : (
                      <Badge variant='danger'>Inactive</Badge>
                    )}
                  </td>
                  <td className='py-3 px-4 text-right'>
                    <div className='flex items-center justify-end gap-2'>
                      <Link
                        to={`/product/${product.slug}`}
                        className='p-1.5 hover:bg-[#F7FAFA] rounded text-xs text-[#565959]'
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleEdit(product)}
                        className='p-1.5 hover:bg-[#F7FAFA] rounded text-[#FF9900]'
                      >
                        <HiPencil className='w-4 h-4' />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        className='p-1.5 hover:bg-[#F7FAFA] rounded text-[#B12704]'
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
    </div>
  );
}
