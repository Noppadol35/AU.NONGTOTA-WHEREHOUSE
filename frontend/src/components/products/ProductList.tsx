"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Modal from "@/components/ui/Modal";
import ProductForm from "./ProductForm";
import { SquarePen, Trash2 } from "lucide-react";

interface Category {
  id: number;
  name: string;
  skuPrefix: string | null;
}

interface Product {
  id: number;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  costPrice: number;
  sellPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  categoryId: number;
  category: Category;
  branchId: number;
  createdAt: string;
}

interface ProductInput {
  sku: string;
  barcode: string;
  name: string;
  description: string | undefined;
  costPrice: number;
  sellPrice: number;
  minStockLevel: number;
  categoryId: number | null;
  branchId: number;
}

export default function ProductList() {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [total, setTotal] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);

  async function fetchCategories() {
    try {
      const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/categories`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data.items ?? []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (categoryId) params.set("categoryId", categoryId);
      params.set("page", "1");
      params.set("pageSize", "20");
      
      const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/products?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [q, categoryId]);

  async function createProduct(data: ProductInput) {
    try {
      const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Create failed");
      }
      
      setOpenCreate(false);
      await fetchProducts();
    } catch (error) {
      console.error("Error creating product:", error);
      alert(error instanceof Error ? error.message : "Create failed");
    }
  }

  async function updateProduct(id: number, data: Partial<ProductInput>) {
    try {
      const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; 
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Update failed");
      }
      
      setOpenEdit(null);
      await fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      alert(error instanceof Error ? error.message : "Update failed");
    }
  }

  async function deleteProduct(id: number) {
    try {
      const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; 
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Delete failed");
      }
      
      setDeleteConfirm(null);
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(error instanceof Error ? error.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">จัดการสินค้า</h1>
            <p className="text-gray-600">ค้นหา แก้ไข และจัดการข้อมูลสินค้าทั้งหมด</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <button 
              className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
              onClick={() => setOpenCreate(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              เพิ่มสินค้าใหม่
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหาสินค้า</label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" 
              placeholder="ค้นหาจากชื่อ, SKU หรือคำอธิบาย..." 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
            />
          </div>
          <div className="lg:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่</label>
            <select 
              className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" 
              value={categoryId} 
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">ทุกหมวดหมู่</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อสินค้า</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมวดหมู่</th>
                {user?.role === 'OWNER' && (
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ต้นทุน</th>
                )}
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนคงเหลือ</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ราคาขาย</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                      <span className="ml-3 text-gray-500">กำลังโหลดข้อมูล...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    ไม่พบข้อมูลสินค้า
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {p.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{p.name}</div>
                        {p.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{p.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {p.category?.name ?? "-"}
                      </span>
                    </td>
                    {user?.role === 'OWNER' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ฿{typeof p.costPrice === 'number' ? p.costPrice.toFixed(2) : '-'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          p.stockQuantity <= (p.minStockLevel || 0) ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {p.stockQuantity.toLocaleString()}
                        </span>
                        {p.stockQuantity <= (p.minStockLevel || 0) && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ต่ำ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ฿{p.sellPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {user?.role !== 'WORKER' && (
                          <>
                            <button
                              onClick={() => setOpenEdit(p)}
                              className="text-orange-600 hover:text-orange-900 p-2 rounded-lg hover:bg-orange-50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <SquarePen />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(p)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <Trash2 />
                              </svg>
                            </button>
                          </>
                        )}
                        {user?.role === 'WORKER' && (
                          <span className="text-xs text-gray-400 italic">ดูข้อมูลเท่านั้น</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {total > 20 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                แสดง <span className="font-medium">1</span> ถึง <span className="font-medium">20</span> จาก <span className="font-medium">{total}</span> รายการ
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  ก่อนหน้า
                </button>
                <button className="px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg">
                  1
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {openCreate && (
        <Modal 
          open={openCreate} 
          onClose={() => setOpenCreate(false)}
          title="เพิ่มสินค้าใหม่"
          size="xl"
        >
          <ProductForm
            mode="create"
            onSubmit={createProduct}
            onCancel={() => setOpenCreate(false)}
          />
        </Modal>
      )}

      {openEdit && (
        <Modal 
          open={!!openEdit} 
          onClose={() => setOpenEdit(null)}
          title="แก้ไขสินค้า"
          size="xl"
        >
          <ProductForm
            mode="edit"
            initial={{
              id: openEdit.id,
              sku: openEdit.sku,
              barcode: openEdit.barcode ?? "",
              name: openEdit.name,
              description: openEdit.description || undefined,
              costPrice: openEdit.costPrice,
              sellPrice: openEdit.sellPrice,
              minStockLevel: openEdit.minStockLevel,
              stockQuantity: openEdit.stockQuantity,
              categoryId: openEdit.category?.id ?? null,
              branchId: openEdit.branchId,
            }}
            onSubmit={(data) => updateProduct(openEdit.id, data)}
            onCancel={() => setOpenEdit(null)}
          />
        </Modal>
      )}

      {deleteConfirm && (
        <Modal
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="ยืนยันการลบสินค้า"
          size="sm"
        >
          <div className="p-6">
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Warning Message */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                คุณแน่ใจหรือไม่?
              </h3>
              <p className="text-sm text-gray-600">
                คุณกำลังจะลบสินค้า{" "}
                <span className="font-semibold text-gray-900">
                  "{deleteConfirm.name}"
                </span>
              </p>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">SKU:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {deleteConfirm.sku}
                  </span>
                </div>
                {deleteConfirm.barcode && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-1">
                    <span className="font-medium">Barcode:</span>
                    <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                      {deleteConfirm.barcode}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-red-600 mt-3 font-medium">
                ⚠️ การลบจะไม่สามารถยกเลิกได้ และจะส่งผลต่อข้อมูลสต็อก
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => deleteProduct(deleteConfirm.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                ลบสินค้า
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}


