"use client";
import { useEffect, useState } from "react";
import { CheckCircle, Package, Tag, DollarSign, Box, Barcode } from "lucide-react";

export type ProductInput = {
  sku: string;
  barcode: string;
  name: string;
  description: string | undefined;
  categoryId: number | null;
  costPrice: number;
  sellPrice: number;
  minStockLevel: number;
  branchId: number;
  stockQuantity?: number;
};

type Props = {
  mode: "create" | "edit";
  initial?: Partial<ProductInput> & { id?: number };
  onSubmit: (data: ProductInput) => Promise<void> | void;
  onCancel: () => void;
};

export default function ProductForm({
  mode,
  initial,
  onSubmit,
  onCancel,
}: Props) {
  const [categories, setCategories] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState<ProductInput | null>(null);

  const [form, setForm] = useState<ProductInput>({
    sku: initial?.sku ?? "",
    barcode: initial?.barcode ?? "",
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    categoryId: initial?.categoryId ?? null,
    costPrice: initial?.costPrice ?? 0,
    sellPrice: initial?.sellPrice ?? 0,
    minStockLevel: initial?.minStockLevel ?? 1,
    branchId: initial?.branchId ?? 1,
    stockQuantity: initial?.stockQuantity ?? 0,
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_URL}/categories`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data.items ?? []);
      } catch (e) {
        console.error("Error loading categories:", e);
      }
    }
    loadCategories();
  }, []);

  // Update form when initial prop changes (for edit mode)
  useEffect(() => {
    if (initial && mode === "edit") {
      setForm({
        sku: initial.sku ?? "",
        barcode: initial.barcode ?? "",
        name: initial.name ?? "",
        description: initial.description ?? "",
        categoryId: initial.categoryId ?? null,
        costPrice: initial.costPrice ?? 0,
        sellPrice: initial.sellPrice ?? 0,
        minStockLevel: initial.minStockLevel ?? 1,
        branchId: initial.branchId ?? 1,
        stockQuantity: initial.stockQuantity ?? 0,
      });
    }
  }, [initial, mode]);

  // Live preview next SKU when typing prefix up to 6 chars
  const [skuPreview, setSkuPreview] = useState<string | null>(null);
  useEffect(() => {
    async function loadNextSku(prefix: string) {
      try {
        const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(
          `${API_URL}/products/next-sku?prefix=${encodeURIComponent(
            prefix
          )}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch next SKU");
        const data = await res.json();
        setSkuPreview(data?.nextSku ?? null);
      } catch (error) {
        console.error("Error loading next SKU:", error);
        setSkuPreview(null);
      }
    }
    const prefix = form.sku.trim();
    if (mode === "create" && /^[A-Za-z0-9]{1,6}$/.test(prefix)) {
      loadNextSku(prefix);
    } else {
      setSkuPreview(null);
    }
  }, [form.sku, mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Store form data and show confirmation modal
    setFormData(form);
    setShowConfirmModal(true);
  }

  async function handleConfirmSubmit() {
    if (!formData) return;

    setLoading(true);
    setError(null);
    try {
      await onSubmit(formData);
      setShowConfirmModal(false);
      setFormData(null);
    } catch (err: any) {
      setError(err?.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              ข้อมูลพื้นฐาน
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm"
                placeholder="เช่น ABC001"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                maxLength={10}
              />
              {skuPreview && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    SKU ถัดไป:{" "}
                    <span className="font-semibold">{skuPreview}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Barcode
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <Barcode className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm"
                  placeholder="1234567890123"
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  maxLength={20}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                ชื่อสินค้า <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm"
                placeholder="ชื่อสินค้า"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                คำอธิบาย
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm resize-none"
                placeholder="รายละเอียดสินค้า..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Category & Branch Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              หมวดหมู่และสาขา
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                หมวดหมู่ <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm"
                value={form.categoryId || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    categoryId: e.target.value ? Number(e.target.value) : null,
                  })
                }
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                สาขา <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm"
                value={form.branchId}
                onChange={(e) =>
                  setForm({ ...form, branchId: Number(e.target.value) })
                }
              >
                <option value={1}>Main Branch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              ราคาและต้นทุน
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                ต้นทุน (บาท) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ฿
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm"
                  placeholder="0.00"
                  value={form.costPrice}
                  onChange={(e) =>
                    setForm({ ...form, costPrice: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                ราคาขาย (บาท) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ฿
                </span>
                <input
                  type="text"
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm"
                  placeholder="0.00"
                  value={form.sellPrice}
                  onChange={(e) =>
                    setForm({ ...form, sellPrice: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stock Management Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Box className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              การจัดการสต็อก
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                จำนวนคงเหลือ
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm"
                placeholder="0"
                value={form.stockQuantity}
                onChange={(e) =>
                  setForm({ ...form, stockQuantity: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                ระดับสต็อกต่ำสุด
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm"
                placeholder="1"
                value={form.minStockLevel}
                onChange={(e) =>
                  setForm({ ...form, minStockLevel: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 border border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              </div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-3 shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                กำลังบันทึก...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                {mode === "create" ? "เพิ่มสินค้า" : "บันทึกการแก้ไข"}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                ยืนยันการแก้ไข
              </h3>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                คุณต้องการบันทึกการแก้ไขสินค้า{" "}
                <span className="font-semibold text-gray-900">
                  {formData?.name}
                </span>{" "}
                หรือไม่?
              </p>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">SKU:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formData?.sku}
                  </span>
                </div>
                {formData?.barcode && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Barcode:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formData.barcode}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">หมวดหมู่:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {categories.find((c) => c.id === formData?.categoryId)
                      ?.name || "ไม่ระบุ"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ราคาขาย:</span>
                  <span className="text-sm font-medium text-gray-900">
                    ฿{formData?.sellPrice?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    ยืนยัน
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
