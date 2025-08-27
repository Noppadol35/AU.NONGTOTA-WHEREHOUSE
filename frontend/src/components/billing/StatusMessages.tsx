"use client";

import { CheckCircle } from "lucide-react";

interface StatusMessagesProps {
  loading: boolean;
  error: string | null;
  success: string | null;
}

export default function StatusMessages({
  loading,
  error,
  success,
}: StatusMessagesProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
          </div>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-green-600" />
          </div>
          <p className="text-sm text-green-700">{success}</p>
        </div>
      </div>
    );
  }

  return null;
}
