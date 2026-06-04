import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productApi } from "../products/productApi";
import { categoryApi } from "../products/categoryApi";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiMagnifyingGlass,
  HiArrowUpTray,
  HiXMark,
  HiPhoto,
} from "react-icons/hi2";
import toast from "react-hot-toast";
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
        toast.success("Product updated successfully");
      } else {
        const { data } = await api.post("/products", productData);
        productId = data.data.product._id;
        toast.success("Product created successfully");
      }

      if (imageFiles.length > 0 && productId) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append("images", file));

        try {
          await api.post(`/products/${productId}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Images uploaded successfully");
        } catch (error) {
          toast.error("Product created, but image upload failed");
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
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;
    try {
      await api.delete(`/products/${productId}`);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleDeleteImage = async (productId, imageId) => {
    if (!confirm("Remove this image?")) return;
    try {
      await api.delete(`/products/${productId}/images/${imageId}`);
      toast.success("Image removed");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to remove image");
    }
  };

  return (
    <div className='max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12'>
      {/* Header Section */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-semibold tracking-tight text-slate-900'>
            Products
          </h1>
          <p className='text-sm text-slate-500 mt-1'>
            Manage your inventory, pricing, and product details.
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <form onSubmit={handleSearch} className='relative flex-1 sm:w-72'>
            <HiMagnifyingGlass className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search products...'
              className='w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border-transparent focus:bg-white border focus:border-slate-300 rounded-xl transition-all duration-200 outline-none focus:ring-4 focus:ring-slate-100 shadow-sm'
            />
          </form>
          <Button
            onClick={handleAdd}
            className='rounded-xl shadow-sm px-4 py-2 font-medium'
          >
            <HiPlus className='w-4 h-4 mr-2 inline-block' /> New Product
          </Button>
        </div>
      </div>

      {/* Products Table Card */}
      <div className='bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden'>
        <div className='overflow-x-auto'>
          {loading ? (
            <div className='p-6'>
              <TableSkeleton rows={5} cols={5} />
            </div>
          ) : (
            <table className='w-full text-sm text-left'>
              <thead>
                <tr className='border-b border-slate-100 bg-slate-50/50'>
                  <th className='py-4 px-6 font-medium text-slate-500'>
                    Product
                  </th>
                  <th className='py-4 px-6 font-medium text-slate-500'>
                    Price
                  </th>
                  <th className='py-4 px-6 font-medium text-slate-500'>
                    Stock
                  </th>
                  <th className='py-4 px-6 font-medium text-slate-500'>
                    Status
                  </th>
                  <th className='py-4 px-6 font-medium text-slate-500 text-right'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan='5'
                      className='py-12 text-center text-slate-500'
                    >
                      No products found. Adjust your search or add a new
                      product.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product._id}
                      className='hover:bg-slate-50/80 transition-colors duration-150 group'
                    >
                      <td className='py-4 px-6'>
                        <div className='flex items-center gap-4'>
                          <div className='h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center'>
                            {product.images?.[0]?.url ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <HiPhoto className='w-5 h-5 text-slate-400' />
                            )}
                          </div>
                          <div>
                            <p className='font-medium text-slate-900 line-clamp-1'>
                              {product.name}
                            </p>
                            <p className='text-xs text-slate-500 mt-0.5'>
                              {product.brand || "Unbranded"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='py-4 px-6 font-medium text-slate-700'>
                        $
                        {product.price?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className='py-4 px-6'>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            product.stock === 0
                              ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10"
                              : product.stock <= 10
                                ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                                : "text-slate-600"
                          }`}
                        >
                          {product.stock} in stock
                        </span>
                      </td>
                      <td className='py-4 px-6'>
                        {product.isActive ? (
                          <Badge
                            variant='success'
                            className='bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant='danger'
                            className='bg-slate-100 text-slate-600 ring-slate-500/10'
                          >
                            Draft
                          </Badge>
                        )}
                      </td>
                      <td className='py-4 px-6'>
                        <div className='flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                          <Link
                            to={`/product/${product.slug}`}
                            className='p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors'
                            title='View Product'
                          >
                            <svg
                              className='w-4 h-4'
                              fill='none'
                              viewBox='0 0 24 24'
                              strokeWidth='1.5'
                              stroke='currentColor'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                d='M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z'
                              />
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
                              />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleEdit(product)}
                            className='p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors'
                            title='Edit'
                          >
                            <HiPencil className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(product._id, product.name)
                            }
                            className='p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors'
                            title='Delete'
                          >
                            <HiTrash className='w-4 h-4' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.pages > 1 && (
          <div className='border-t border-slate-100 px-6 py-4 bg-slate-50/30'>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Modern Glassmorphic Form Modal */}
      {showForm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6'>
          <div
            className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity'
            onClick={() => setShowForm(false)}
          />
          <div className='relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200'>
            <div className='px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white/50'>
              <h2 className='text-xl font-semibold text-slate-900'>
                {editingId ? "Edit Product" : "Create New Product"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className='p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors'
              >
                <HiXMark className='w-5 h-5' />
              </button>
            </div>

            <div className='p-8 overflow-y-auto custom-scrollbar'>
              <form
                id='product-form'
                onSubmit={handleSubmit}
                className='space-y-8'
              >
                {/* General Info Bento Box */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                  <div className='sm:col-span-2'>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Product Title *
                    </label>
                    <input
                      type='text'
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className='w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none'
                      required
                      placeholder='e.g. Minimalist Desk Mat'
                    />
                  </div>

                  <div className='sm:col-span-2'>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={4}
                      className='w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none'
                      placeholder='Describe the product details...'
                    />
                  </div>
                </div>

                <hr className='border-slate-100' />

                {/* Pricing & Inventory */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Price ($) *
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      className='w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Compare at Price ($)
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      value={form.comparePrice}
                      onChange={(e) =>
                        setForm({ ...form, comparePrice: e.target.value })
                      }
                      className='w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none'
                      placeholder='Original price'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Brand
                    </label>
                    <input
                      type='text'
                      value={form.brand}
                      onChange={(e) =>
                        setForm({ ...form, brand: e.target.value })
                      }
                      className='w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Stock Quantity
                    </label>
                    <input
                      type='number'
                      value={form.stock}
                      onChange={(e) =>
                        setForm({ ...form, stock: e.target.value })
                      }
                      className='w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className='w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none'
                      required
                    >
                      <option value=''>Select category</option>
                      {categories.map((cat) => renderCategoryOptions([cat]))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Tags
                    </label>
                    <input
                      type='text'
                      value={form.tags}
                      onChange={(e) =>
                        setForm({ ...form, tags: e.target.value })
                      }
                      placeholder='tech, minimal, desk'
                      className='w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none'
                    />
                  </div>
                </div>

                {/* Media & Features */}
                <div className='bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-6'>
                  <label className='flex items-center gap-3 cursor-pointer group w-max'>
                    <div className='relative flex items-center justify-center'>
                      <input
                        type='checkbox'
                        checked={form.isFeatured}
                        onChange={(e) =>
                          setForm({ ...form, isFeatured: e.target.checked })
                        }
                        className='peer sr-only'
                      />
                      <div className='w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-slate-900 peer-checked:border-slate-900 transition-colors'></div>
                      <svg
                        className='absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth='3'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    </div>
                    <span className='text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors'>
                      Feature this product on homepage
                    </span>
                  </label>

                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-3'>
                      Media Gallery
                    </label>

                    {/* Bento Grid for Images */}
                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                      {editingId &&
                        existingImages.length > 0 &&
                        existingImages.map((img) => (
                          <div
                            key={img._id}
                            className='relative aspect-square group rounded-xl overflow-hidden border border-slate-200 bg-white'
                          >
                            <img
                              src={img.url}
                              alt=''
                              className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                            />
                            <div className='absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity' />
                            <button
                              type='button'
                              onClick={() =>
                                handleDeleteImage(editingId, img._id)
                              }
                              className='absolute top-2 right-2 bg-white/90 backdrop-blur text-slate-700 hover:text-red-600 rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm'
                            >
                              <HiXMark className='w-4 h-4' />
                            </button>
                          </div>
                        ))}

                      <label
                        className={`aspect-square flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          uploadingImages
                            ? "border-blue-400 bg-blue-50/50"
                            : "border-slate-300 hover:border-slate-400 hover:bg-slate-50 bg-white"
                        }`}
                      >
                        {uploadingImages ? (
                          <>
                            <Spinner className='w-6 h-6 text-blue-600' />
                            <span className='text-xs font-medium text-blue-600'>
                              Uploading...
                            </span>
                          </>
                        ) : (
                          <>
                            <div className='w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-1'>
                              <HiArrowUpTray className='w-5 h-5 text-slate-400' />
                            </div>
                            <span className='text-xs font-medium text-slate-500 text-center px-2'>
                              {imageFiles.length > 0
                                ? `${imageFiles.length} ready`
                                : "Add Photos"}
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
                                toast.success(
                                  `${files.length} photo(s) uploaded`,
                                );
                              } catch (error) {
                                toast.error("Upload failed");
                              } finally {
                                setUploadingImages(false);
                              }
                            } else {
                              setImageFiles(files);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {!editingId && imageFiles.length > 0 && (
                      <p className='text-xs text-slate-500 mt-3 flex items-center gap-1.5'>
                        <span className='w-1.5 h-1.5 rounded-full bg-blue-500 inline-block'></span>
                        Images will upload automatically when you create the
                        product.
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className='px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3'>
              <Button
                type='button'
                variant='outline'
                className='rounded-xl px-5 py-2.5 shadow-sm border-slate-200 text-slate-700 hover:bg-slate-100'
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                form='product-form'
                type='submit'
                disabled={saving}
                className='rounded-xl px-6 py-2.5 shadow-sm bg-slate-900 text-white hover:bg-slate-800'
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Product"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
