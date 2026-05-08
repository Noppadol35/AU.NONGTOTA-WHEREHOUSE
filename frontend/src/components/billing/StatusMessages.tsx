"use client";

import { Loader2 } from "lucide-react";

interface StatusMessagesProps {
  loading: boolean;
  error: string | null;
  success: string | null;
}

export default function StatusMessages({ loading, error, success }: StatusMessagesProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-3" />
          <p className="text-muted-foreground text-sm font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
        <p className="text-sm text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
        <p className="text-sm text-green-700 font-medium">{success}</p>
      </div>
    );
  }

  return null;
}
