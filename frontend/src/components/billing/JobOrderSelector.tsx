"use client";

import { FileText } from "lucide-react";

interface JobOrder {
  id: number;
  jobNumber: string;
  customerName: string;
  issueDetail?: string;
  jobDetail?: string;
  carType: string;
}

interface JobOrderSelectorProps {
  jobOrders: JobOrder[];
  selectedJobOrderId: number | null;
  onJobOrderSelect: (jobOrderId: number | null) => void;
}

export default function JobOrderSelector({
  jobOrders,
  selectedJobOrderId,
  onJobOrderSelect,
}: JobOrderSelectorProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-orange-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          เลือกงานสั่งทำ
        </h2>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          เลือกงานสั่งทำ (เฉพาะงานที่มีสถานะ "กำลังดำเนินการ")
        </label>
        <div className="relative">
          <select
            value={selectedJobOrderId || ""}
            onChange={(e) =>
              onJobOrderSelect(Number(e.target.value) || null)
            }
            className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
          >
            <option value="">-- เลือกงานสั่งทำ --</option>
            {jobOrders.map((jobOrder) => (
              <option key={jobOrder.id} value={jobOrder.id}>
                {jobOrder.customerName} -{" "}
                {jobOrder.issueDetail?.substring(0, 50) ||
                  jobOrder.jobDetail?.substring(0, 50) ||
                  jobOrder.carType ||
                  "ไม่มีรายละเอียด"}
                ...
              </option>
            ))}
          </select>
        </div>

        {jobOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>ไม่มีงานสั่งทำที่มีสถานะ "กำลังดำเนินการ"</p>
          </div>
        )}
      </div>
    </div>
  );
}
