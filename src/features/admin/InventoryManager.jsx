import { useState, useEffect } from "react";
import api from "../../utils/axios";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import {
  HiArchiveBox,
  HiPlus,
  HiMinus,
  HiExclamationTriangle,
  HiCheckCircle,
  HiXCircle,
  HiArrowPath,
  HiMagnifyingGlass,
} from "react-icons/hi2";
import toast from "react-hot-toast";
import TableSkeleton from "../../components/ui/TableSkeleton";

export default function InventoryManager() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [stockForm, setStockForm] = useState({
    quantity: "",
    reason: "restock",
    note: "",
  });
  const [activeTab, setActiveTab] = useState("all"); // all, low, out

  useEffect(() => {
    fetchProducts();
  }, [page, activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let data;
      if (activeTab === "low") {
        const res = await api.get("/inventory/low-stock?threshold=10");
        setProducts(res.data.data.products || []);
        setPagination(null);
      } else if (activeTab === "out") {
        const res = await api.get("/inventory/out-of-stock");
        setProducts(res.data.data.products || []);
        setPagination(null);
      } else {
        const params = { page, limit: 10 };
        if (search) params.search = search;
        const res = await api.get("/products", { params });
        setProducts(res.data.data.products);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (productId, variantId = null) => {
    if (!stockForm.quantity) {
      toast.error("Enter a quantity");
      return;
    }

    setUpdating(true);
    try {
      const url = variantId
        ? `/inventory/${productId}/stock?variantId=${variantId}`
        : `/inventory/${productId}/stock`;

      await api.put(url, {
        quantity: Number(stockForm.quantity),
        reason: stockForm.reason,
        note: stockForm.note,
      });

      toast.success("Stock updated!");
      setSelectedProduct(null);
      setStockForm({ quantity: "", reason: "restock", note: "" });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update stock");
    } finally {
      setUpdating(false);
    }
  };

  const openStockModal = (product, variant = null) => {
    setSelectedProduct({ product, variant });
    setStockForm({
      quantity: "",
      reason: variant ? "restock" : "restock",
      note: "",
    });
  };

  const getStockStatus = (stock) => {
    if (stock === 0)
      return { color: "danger", icon: HiXCircle, label: "Out of Stock" };
    if (stock <= 10)
      return {
        color: "warning",
        icon: HiExclamationTriangle,
        label: "Low Stock",
      };
    return { color: "success", icon: HiCheckCircle, label: "In Stock" };
  };

  const tabs = [
    { key: "all", label: "All Products", icon: HiArchiveBox },
    { key: "low", label: "Low Stock", icon: HiExclamationTriangle },
    { key: "out", label: "Out of Stock", icon: HiXCircle },
  ];

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-[#0F1111]'>Inventory</h1>
        <p className='text-sm text-[#565959] mt-1'>
          Manage stock levels across all products and variants.
        </p>
      </div>

      {/* Stats Overview */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <div className='bg-white rounded-xl p-5 shadow-sm border border-[#D5D9D9] flex items-center gap-4'>
          <div className='p-3 rounded-xl bg-green-50'>
            <HiCheckCircle className='w-6 h-6 text-green-600' />
          </div>
          <div>
            <p className='text-2xl font-bold text-[#0F1111]'>
              {products.filter((p) => p.stock > 10).length}
            </p>
            <p className='text-xs text-[#565959]'>In Stock</p>
          </div>
        </div>
        <div className='bg-white rounded-xl p-5 shadow-sm border border-[#D5D9D9] flex items-center gap-4'>
          <div className='p-3 rounded-xl bg-yellow-50'>
            <HiExclamationTriangle className='w-6 h-6 text-yellow-600' />
          </div>
          <div>
            <p className='text-2xl font-bold text-[#0F1111]'>
              {products.filter((p) => p.stock > 0 && p.stock <= 10).length}
            </p>
            <p className='text-xs text-[#565959]'>Low Stock</p>
          </div>
        </div>
        <div className='bg-white rounded-xl p-5 shadow-sm border border-[#D5D9D9] flex items-center gap-4'>
          <div className='p-3 rounded-xl bg-red-50'>
            <HiXCircle className='w-6 h-6 text-red-600' />
          </div>
          <div>
            <p className='text-2xl font-bold text-[#0F1111]'>
              {products.filter((p) => p.stock === 0).length}
            </p>
            <p className='text-xs text-[#565959]'>Out of Stock</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex gap-2 border-b border-[#D5D9D9]'>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-[#FF9900] text-[#FF9900]"
                : "border-transparent text-[#565959] hover:text-[#0F1111]"
            }`}
          >
            <tab.icon className='w-4 h-4' />
            {tab.label}
          </button>
        ))}

        {activeTab === "all" && (
          <div className='ml-auto flex items-center'>
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
              placeholder='Search products...'
              className='px-3 py-2 text-sm border border-[#D5D9D9] rounded-lg w-48'
            />
            <button
              onClick={fetchProducts}
              className='p-2 ml-1 hover:bg-[#F7FAFA] rounded-lg'
            >
              <HiMagnifyingGlass className='w-4 h-4 text-[#565959]' />
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className='bg-white rounded-xl shadow-sm border overflow-hidden'>
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : products.length === 0 ? (
          <div className='p-12 text-center'>
            <HiArchiveBox className='w-16 h-16 text-[#D5D9D9] mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-[#0F1111] mb-1'>
              All good!
            </h3>
            <p className='text-[#565959]'>No products match this filter.</p>
          </div>
        ) : (
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-[#D5D9D9] bg-[#F7FAFA]'>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  Product
                </th>
                <th className='text-left py-3 px-4 font-medium text-[#565959]'>
                  SKU
                </th>
                <th className='text-center py-3 px-4 font-medium text-[#565959]'>
                  Stock
                </th>
                <th className='text-center py-3 px-4 font-medium text-[#565959]'>
                  Status
                </th>
                <th className='text-center py-3 px-4 font-medium text-[#565959]'>
                  Variants
                </th>
                <th className='text-right py-3 px-4 font-medium text-[#565959]'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const status = getStockStatus(product.stock);
                const StatusIcon = status.icon;
                const variantCount = product.variants?.length || 0;

                return (
                  <tr
                    key={product._id}
                    className='border-b border-[#D5D9D9] hover:bg-[#F7FAFA] transition-colors'
                  >
                    <td className='py-3 px-4'>
                      <div className='flex items-center gap-3'>
                        <img
                          src={
                            product.images?.[0]?.url ||
                            "https://via.placeholder.com/36x36?text=No+Image"
                          }
                          alt={product.name}
                          className='w-9 h-9 object-cover rounded-lg'
                        />
                        <div>
                          <p className='font-medium text-[#0F1111]'>
                            {product.name}
                          </p>
                          <p className='text-xs text-[#565959]'>
                            ${product.price?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className='py-3 px-4 text-xs font-mono text-[#565959]'>
                      {product.sku || "N/A"}
                    </td>
                    <td className='py-3 px-4 text-center'>
                      <span
                        className={`text-lg font-bold ${
                          product.stock === 0
                            ? "text-[#B12704]"
                            : product.stock <= 10
                              ? "text-[#FF9900]"
                              : "text-[#0F1111]"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className='py-3 px-4 text-center'>
                      <div className='flex items-center justify-center gap-1'>
                        <StatusIcon
                          className={`w-4 h-4 ${
                            product.stock === 0
                              ? "text-red-500"
                              : product.stock <= 10
                                ? "text-yellow-500"
                                : "text-green-500"
                          }`}
                        />
                        <span className='text-xs'>{status.label}</span>
                      </div>
                    </td>
                    <td className='py-3 px-4 text-center'>
                      {variantCount > 0 ? (
                        <span className='text-xs bg-[#F7FAFA] px-2 py-0.5 rounded-full'>
                          {variantCount} variant{variantCount > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className='text-xs text-[#565959]'>None</span>
                      )}
                    </td>
                    <td className='py-3 px-4 text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        <Button
                          size='sm'
                          onClick={() => openStockModal(product)}
                        >
                          <HiArrowPath className='w-3 h-3 mr-1' /> Update
                        </Button>
                        {variantCount > 0 && (
                          <button
                            onClick={() => openStockModal(product)}
                            className='text-xs text-[#FF9900] hover:underline ml-1'
                          >
                            View variants
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {pagination && activeTab === "all" && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={setPage}
        />
      )}

      {/* Stock Update Modal */}
      {selectedProduct && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div
            className='fixed inset-0 bg-black/50'
            onClick={() => setSelectedProduct(null)}
          />
          <div className='relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto'>
            {/* Header */}
            <div className='p-6 border-b border-[#D5D9D9]'>
              <div className='flex items-center gap-3'>
                <img
                  src={
                    selectedProduct.product.images?.[0]?.url ||
                    "https://via.placeholder.com/40x40?text=No+Image"
                  }
                  alt={selectedProduct.product.name}
                  className='w-10 h-10 object-cover rounded-lg'
                />
                <div>
                  <h2 className='font-bold text-[#0F1111]'>
                    {selectedProduct.product.name}
                  </h2>
                  <p className='text-xs text-[#565959]'>
                    SKU: {selectedProduct.product.sku || "N/A"}
                  </p>
                </div>
                <div className='ml-auto text-right'>
                  <p className='text-xs text-[#565959]'>Current Stock</p>
                  <p
                    className={`text-xl font-bold ${
                      selectedProduct.product.stock === 0
                        ? "text-[#B12704]"
                        : "text-[#0F1111]"
                    }`}
                  >
                    {selectedProduct.variant
                      ? selectedProduct.variant.stock
                      : selectedProduct.product.stock}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className='p-6 space-y-4'>
              {/* Variants list */}
              {!selectedProduct.variant &&
                selectedProduct.product.variants?.length > 0 && (
                  <div>
                    <h3 className='text-sm font-bold text-[#0F1111] mb-2 uppercase'>
                      Variants
                    </h3>
                    <div className='space-y-2'>
                      {selectedProduct.product.variants.map((v) => {
                        const vStatus = getStockStatus(v.stock);
                        return (
                          <div
                            key={v._id}
                            className='flex items-center justify-between p-3 bg-[#F7FAFA] rounded-xl hover:bg-[#F0F2F2] cursor-pointer transition-colors'
                            onClick={() =>
                              openStockModal(selectedProduct.product, v)
                            }
                          >
                            <div>
                              <p className='text-sm font-medium'>{v.name}</p>
                              {v.attributes?.map((attr) => (
                                <span
                                  key={attr._id}
                                  className='text-xs text-[#565959] mr-2'
                                >
                                  {attr.name}: {attr.value}
                                </span>
                              ))}
                            </div>
                            <div className='flex items-center gap-3'>
                              <span
                                className={`font-bold ${v.stock === 0 ? "text-[#B12704]" : ""}`}
                              >
                                {v.stock}
                              </span>
                              <vStatus.icon
                                className={`w-4 h-4 ${
                                  v.stock === 0
                                    ? "text-red-500"
                                    : v.stock <= 10
                                      ? "text-yellow-500"
                                      : "text-green-500"
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className='border-t mt-4 pt-4'>
                      <h3 className='text-sm font-bold text-[#0F1111] mb-3 uppercase'>
                        Update Main Stock
                      </h3>
                      <StockForm
                        stockForm={stockForm}
                        setStockForm={setStockForm}
                        onSubmit={() =>
                          handleStockUpdate(selectedProduct.product._id)
                        }
                        onCancel={() => setSelectedProduct(null)}
                        updating={updating}
                      />
                    </div>
                  </div>
                )}

              {/* No variants or variant selected */}
              {(selectedProduct.variant ||
                selectedProduct.product.variants?.length === 0) && (
                <div>
                  {selectedProduct.variant && (
                    <div className='mb-4 flex items-center gap-2'>
                      <span className='text-xs bg-[#FF9900] text-white px-2 py-0.5 rounded-full'>
                        Variant: {selectedProduct.variant.name}
                      </span>
                      <button
                        onClick={() => openStockModal(selectedProduct.product)}
                        className='text-xs text-[#FF9900] hover:underline'
                      >
                        Back to product
                      </button>
                    </div>
                  )}
                  <StockForm
                    stockForm={stockForm}
                    setStockForm={setStockForm}
                    onSubmit={() =>
                      handleStockUpdate(
                        selectedProduct.product._id,
                        selectedProduct.variant?._id,
                      )
                    }
                    onCancel={() => setSelectedProduct(null)}
                    updating={updating}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stock Form Sub-component
function StockForm({ stockForm, setStockForm, onSubmit, onCancel, updating }) {
  return (
    <div className='space-y-4'>
      <div>
        <label className='block text-sm font-medium text-[#0F1111] mb-2'>
          Quantity
        </label>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={() =>
              setStockForm({
                ...stockForm,
                quantity: Math.abs(Number(stockForm.quantity || 0)) * -1,
              })
            }
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              Number(stockForm.quantity) < 0
                ? "bg-red-50 text-red-600 border-2 border-red-200"
                : "bg-white text-[#565959] border-2 border-[#D5D9D9] hover:border-red-300"
            }`}
          >
            <HiMinus className='w-4 h-4 inline mr-1' /> Remove
          </button>
          <input
            type='number'
            value={stockForm.quantity}
            onChange={(e) =>
              setStockForm({ ...stockForm, quantity: e.target.value })
            }
            placeholder='0'
            className='w-24 text-center text-lg font-bold border-2 border-[#D5D9D9] rounded-xl focus:outline-none focus:border-[#FF9900]'
          />
          <button
            type='button'
            onClick={() =>
              setStockForm({
                ...stockForm,
                quantity: Math.abs(Number(stockForm.quantity || 0)),
              })
            }
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              Number(stockForm.quantity) > 0
                ? "bg-green-50 text-green-600 border-2 border-green-200"
                : "bg-white text-[#565959] border-2 border-[#D5D9D9] hover:border-green-300"
            }`}
          >
            <HiPlus className='w-4 h-4 inline mr-1' /> Add
          </button>
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-[#0F1111] mb-2'>
          Reason
        </label>
        <select
          value={stockForm.reason}
          onChange={(e) =>
            setStockForm({ ...stockForm, reason: e.target.value })
          }
          className='w-full px-4 py-2.5 text-sm border-2 border-[#D5D9D9] rounded-xl focus:outline-none focus:border-[#FF9900]'
        >
          <option value='restock'>Restock</option>
          <option value='adjustment'>Adjustment</option>
          <option value='return'>Return</option>
          <option value='damage'>Damage</option>
        </select>
      </div>

      <div>
        <label className='block text-sm font-medium text-[#0F1111] mb-2'>
          Note (optional)
        </label>
        <input
          type='text'
          value={stockForm.note}
          onChange={(e) => setStockForm({ ...stockForm, note: e.target.value })}
          placeholder='Add a note...'
          className='w-full px-4 py-2.5 text-sm border-2 border-[#D5D9D9] rounded-xl focus:outline-none focus:border-[#FF9900]'
        />
      </div>

      <div className='flex gap-3'>
        <Button
          onClick={onSubmit}
          disabled={updating || !stockForm.quantity}
          className='flex-1'
        >
          {updating ? "Updating..." : "Update Stock"}
        </Button>
        <Button variant='outline' onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
