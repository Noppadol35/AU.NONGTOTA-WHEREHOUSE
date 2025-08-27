"use client";

import { Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";

interface User {
  id: number;
  username: string;
  fullName: string | null;
  role: "OWNER" | "MANAGER" | "WORKER";
  branchId: number;
  branch: {
    id: number;
    name: string;
  };
}

interface DeleteConfirmModalProps {
  user: User | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export default function DeleteConfirmModal({
  user,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!user) return null;

  const getRoleInfo = (role: string) => {
    switch (role) {
      case "OWNER":
        return { label: "เจ้าของระบบ", color: "bg-red-100 text-red-800" };
      case "MANAGER":
        return { label: "ผู้จัดการ", color: "bg-blue-100 text-blue-800" };
      case "WORKER":
        return { label: "พนักงาน", color: "bg-green-100 text-green-800" };
      default:
        return { label: "ไม่ระบุ", color: "bg-gray-100 text-gray-800" };
    }
  };

  const roleInfo = getRoleInfo(user.role);

  const handleConfirm = async () => {
    await onConfirm(user.id);
  };

  return (
    <Modal
      open={!!user}
      onClose={onClose}
      title="ยืนยันการลบผู้ใช้"
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
            คุณกำลังจะลบผู้ใช้{" "}
            <span className="font-semibold text-gray-900">
              {user.fullName || user.username}
            </span>
          </p>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Username:</span>
              <span className="text-sm font-medium text-gray-900">
                @{user.username}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">สิทธิ์:</span>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">สาขา:</span>
              <span className="text-sm font-medium text-gray-900">
                {user.branch?.name || "ไม่ระบุสาขา"}
              </span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              </div>
              <p className="text-sm font-semibold text-red-800">คำเตือน</p>
            </div>
            <p className="text-xs text-red-700">
              การลบผู้ใช้นี้จะไม่สามารถยกเลิกได้
              <br />
              ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้อีกต่อไป
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            ลบผู้ใช้
          </button>
        </div>
      </div>
    </Modal>
  );
}
