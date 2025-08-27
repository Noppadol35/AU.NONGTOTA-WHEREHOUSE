"use client";

import { Receipt, Printer, Download } from "lucide-react";

interface BillingHeaderProps {
  onPrint: () => void;
  onDownload: () => void;
}

export default function BillingHeader({
  onPrint,
  onDownload,
}: BillingHeaderProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4 mb-4 lg:mb-0">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ใบแจ้งหนี้ (Billing)
            </h1>
            <p className="text-gray-600">
              รายละเอียดงานและประวัติการเบิกสินค้า
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Printer className="w-4 h-4" />
            พิมพ์
          </button>
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            ดาวน์โหลด
          </button>
        </div>
      </div>
    </div>
  );
}
