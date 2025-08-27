"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, FolderCog } from "lucide-react";
import Modal from "@/components/ui/Modal";

interface Category {
  id: number;
  name: string;
  skuPrefix: string | null;
  productCount: number;
}

interface CategoryFormData {
  name: string;
  skuPrefix: string;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    skuPrefix: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data.items ?? []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createCategory(data: CategoryFormData) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
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
      setFormData({ name: "", skuPrefix: "" });
      await fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
      alert(error instanceof Error ? error.message : "Create failed");
    }
  }

  async function updateCategory(id: number, data: CategoryFormData) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
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
      setFormData({ name: "", skuPrefix: "" });
      await fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      alert(error instanceof Error ? error.message : "Update failed");
    }
  }

  async function deleteCategory(id: number) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Delete failed");
      }
      
      setDeleteConfirm(null);
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(error instanceof Error ? error.message : "Delete failed");
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (openEdit) {
      updateCategory(openEdit.id, formData);
    } else {
      createCategory(formData);
    }
  };

  const handleEdit = (category: Category) => {
    setOpenEdit(category);
    setFormData({
      name: category.name,
      skuPrefix: category.skuPrefix || "",
    });
  };

  const handleCancel = () => {
    setOpenCreate(false);
    setOpenEdit(null);
    setFormData({ name: "", skuPrefix: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderCog className="w-8 h-8 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">จัดการหมวดหมู่</h2>
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          เพิ่มหมวดหมู่
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อหมวดหมู่
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU Prefix
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จำนวนสินค้า
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                      <span className="ml-3 text-gray-500">กำลังโหลดข้อมูล...</span>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    ไม่พบข้อมูลหมวดหมู่
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {category.skuPrefix ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {category.skuPrefix}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          category.productCount > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {category.productCount.toLocaleString()}
                        </span>
                        {category.productCount > 0 && (
                          <span className="text-xs text-gray-500">
                            สินค้า
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-orange-600 hover:text-orange-900 p-2 rounded-lg hover:bg-orange-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(category)}
                          disabled={category.productCount > 0}
                          className={`p-2 rounded-lg transition-colors ${
                            category.productCount > 0
                              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                              : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                          }`}
                          title={
                            category.productCount > 0
                              ? `ไม่สามารถลบได้ - มีสินค้า ${category.productCount} รายการ`
                              : 'ลบหมวดหมู่'
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(openCreate || openEdit) && (
        <Modal
          open={openCreate || !!openEdit}
          onClose={handleCancel}
          title={openEdit ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-6 p-2">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ชื่อหมวดหมู่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm"
                  placeholder="ชื่อหมวดหมู่ เช่น อะไหล่รถยนต์, น้ำมันเครื่อง"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  SKU Prefix
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm"
                  placeholder="เช่น ABC, XYZ (ไม่บังคับ)"
                  value={formData.skuPrefix}
                  onChange={(e) => setFormData({ ...formData, skuPrefix: e.target.value })}
                  maxLength={6}
                />
                <p className="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  💡 <strong>SKU Prefix</strong> ใช้สำหรับสร้าง SKU อัตโนมัติ (สูงสุด 6 ตัวอักษร)
                  <br />
                  ตัวอย่าง: หากตั้งเป็น "ABC" จะได้ SKU เป็น "ABC0001", "ABC0002" เป็นต้น
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 font-medium shadow-lg"
              >
                {openEdit ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Modal
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="ยืนยันการลบหมวดหมู่"
          size="sm"
        >
          <div className="p-6">
            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Warning Message */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                คุณแน่ใจหรือไม่?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                คุณกำลังจะลบหมวดหมู่{" "}
                <span className="font-semibold text-gray-900">
                  "{deleteConfirm.name}"
                </span>
              </p>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ชื่อหมวดหมู่:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {deleteConfirm.name}
                  </span>
                </div>
                {deleteConfirm.skuPrefix && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">SKU Prefix:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {deleteConfirm.skuPrefix}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">จำนวนสินค้า:</span>
                  <span className={`text-sm font-medium ${
                    deleteConfirm.productCount > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {deleteConfirm.productCount.toLocaleString()} รายการ
                  </span>
                </div>
              </div>

              {deleteConfirm.productCount > 0 ? (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    </div>
                    <p className="text-sm font-semibold text-red-800">ไม่สามารถลบได้</p>
                  </div>
                  <p className="text-xs text-red-700">
                    หมวดหมู่นี้มีสินค้าอยู่ <strong>{deleteConfirm.productCount.toLocaleString()} รายการ</strong>
                    <br />
                    คุณต้องย้ายหรือลบสินค้าทั้งหมดออกจากหมวดหมู่นี้ก่อน จึงจะสามารถลบหมวดหมู่ได้
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                    </div>
                    <p className="text-sm font-semibold text-yellow-800">คำเตือน</p>
                  </div>
                  <p className="text-xs text-yellow-700">
                    การลบหมวดหมู่นี้จะไม่สามารถยกเลิกได้
                    <br />
                    หมวดหมู่จะถูกลบออกจากระบบอย่างถาวร
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => deleteCategory(deleteConfirm.id)}
                disabled={deleteConfirm.productCount > 0}
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 ${
                  deleteConfirm.productCount > 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {deleteConfirm.productCount > 0 ? 'ไม่สามารถลบได้' : 'ลบหมวดหมู่'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
