"use client";

import {
  Activity,
  User,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Modal from "@/components/ui/Modal";

interface AuditLog {
  id: number;
  user: string;
  action: string;
  details: string;
  ip: string;
  time: string;
  entityType: string;
  entityId?: number;
  oldValues?: any;
  newValues?: any;
}

interface AuditLogDetailModalProps {
  auditLog: AuditLog | null;
  onClose: () => void;
}

export default function AuditLogDetailModal({
  auditLog,
  onClose,
}: AuditLogDetailModalProps) {
  if (!auditLog) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      open={!!auditLog}
      onClose={onClose}
      title="รายละเอียด Audit Log"
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Header Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {auditLog.action}
              </h3>
              <p className="text-sm text-gray-600">
                {auditLog.entityType}
                {auditLog.entityId &&
                  ` (ID: ${auditLog.entityId})`}
              </p>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              ข้อมูลผู้ใช้
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Username:</span>
                <span className="text-sm font-medium text-gray-900">
                  @{auditLog.user}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">IP Address:</span>
                <span className="text-sm font-medium text-gray-900 font-mono">
                  {auditLog.ip}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">รายละเอียด:</span>
                <span className="text-sm text-gray-900 max-w-xs truncate" title={auditLog.details}>
                  {auditLog.details}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              ข้อมูลเวลา
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">เวลา:</span>
                <span className="text-sm font-medium text-gray-900">
                  {auditLog.time}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            รายละเอียด
          </h4>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-900 leading-relaxed">
              {auditLog.details}
            </p>
          </div>
        </div>

        {/* Old/New Values (if available) */}
        {(auditLog.oldValues || auditLog.newValues) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {auditLog.oldValues && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  ค่าเดิม
                </h4>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-32">
                    {JSON.stringify(auditLog.oldValues, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {auditLog.newValues && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />
                  ค่าใหม่
                </h4>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-32">
                    {JSON.stringify(auditLog.newValues, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <div className="flex items-center justify-end pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium"
          >
            ปิด
          </button>
        </div>
      </div>
    </Modal>
  );
}
