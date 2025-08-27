"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  User,
  Shield,
  Lock,
  X,
  Save,
  ChevronDown,
} from "lucide-react";
import Modal from "@/components/ui/Modal";

interface User {
  id: number;
  username: string;
  fullName: string | null;
  role: "OWNER" | "MANAGER" | "WORKER";
  createdAt: string;
  branchId: number;
  branch: {
    id: number;
    name: string;
  };
}

interface UserFormData {
  username: string;
  fullName: string;
  role: "OWNER" | "MANAGER" | "WORKER";
  branchId: number;
  password?: string;
}

interface Branch {
  id: number;
  name: string;
}

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  branches: Branch[];
  onSubmit: (data: UserFormData) => Promise<void>;
}

export default function UserForm({
  open,
  onClose,
  user,
  branches,
  onSubmit,
}: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    fullName: "",
    role: "WORKER",
    branchId: 1,
  });

  const isEdit = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        fullName: user.fullName || "",
        role: user.role,
        branchId: user.branchId,
      });
    } else {
      setFormData({
        username: "",
        fullName: "",
        role: "WORKER",
        branchId: 1,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-0 p-2">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 mb-6 border border-orange-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              {isEdit ? (
                <Edit className="w-6 h-6 text-orange-600" />
              ) : (
                <Plus className="w-6 h-6 text-orange-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isEdit ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
              </h3>
              <p className="text-sm text-gray-600">
                {isEdit
                  ? "อัพเดทข้อมูลผู้ใช้ในระบบ"
                  : "สร้างบัญชีผู้ใช้ใหม่สำหรับการเข้าถึงระบบ"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              ข้อมูลพื้นฐาน
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">@</span>
                  </div>
                  <input
                    type="text"
                    required
                    disabled={isEdit}
                    className="w-full pl-8 pr-4 py-3 border text-gray-900 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="ชื่อผู้ใช้"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                </div>
                {isEdit && (
                  <p className="mt-2 text-xs text-gray-500">
                    ไม่สามารถเปลี่ยน username ได้
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm"
                  placeholder="ชื่อ-นามสกุล"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Role & Branch Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              สิทธิ์และสาขา
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สิทธิ์ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm appearance-none bg-white"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as any })
                    }
                  >
                    <option value="WORKER">พนักงาน</option>
                    <option value="MANAGER">ผู้จัดการ</option>
                    <option value="OWNER">เจ้าของระบบ</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สาขา <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm appearance-none bg-white"
                    value={formData.branchId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        branchId: Number(e.target.value),
                      })
                    }
                  >
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Section (Only for Create) */}
          {!isEdit && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-600" />
                รหัสผ่าน
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm"
                  placeholder="รหัสผ่าน"
                  value={formData.password || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="text-xs text-blue-800">
                      <p className="font-medium mb-1">ความปลอดภัย:</p>
                      <ul className="space-y-1">
                        <li>• รหัสผ่านจะถูกเข้ารหัสก่อนบันทึกลงฐานข้อมูล</li>
                        <li>• ควรใช้รหัสผ่านที่แข็งแกร่ง (ตัวอักษร + ตัวเลข + สัญลักษณ์)</li>
                        <li>• ความยาวขั้นต่ำ 8 ตัวอักษร</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-200 mt-8">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            ยกเลิก
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 font-medium shadow-lg flex items-center gap-2"
          >
            {isEdit ? (
              <>
                <Save className="w-4 h-4" />
                บันทึกการแก้ไข
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                เพิ่มผู้ใช้
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
