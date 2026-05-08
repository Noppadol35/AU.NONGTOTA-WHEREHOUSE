"use client";

import { FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <Card className="border-none shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />
      <CardHeader className="pb-4 border-b border-gray-100/50 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-lg">เลือกงานสั่งทำ</CardTitle>
            <CardDescription>เฉพาะงานที่มีสถานะ &quot;กำลังดำเนินการ&quot;</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">เลือกงานสั่งทำ</label>
          <Select
            value={selectedJobOrderId ? String(selectedJobOrderId) : ""}
            onValueChange={(val) => onJobOrderSelect(val ? Number(val) : null)}
          >
            <SelectTrigger className="w-full h-12 bg-white">
              <SelectValue placeholder="-- เลือกงานสั่งทำ --" />
            </SelectTrigger>
            <SelectContent>
              {jobOrders.map((jobOrder) => (
                <SelectItem key={jobOrder.id} value={String(jobOrder.id)}>
                  {jobOrder.customerName} — {jobOrder.issueDetail?.substring(0, 50) || jobOrder.jobDetail?.substring(0, 50) || jobOrder.carType || "ไม่มีรายละเอียด"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {jobOrders.length === 0 && (
          <div className="text-center py-8 mt-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">ไม่มีงานสั่งทำที่มีสถานะ &quot;กำลังดำเนินการ&quot;</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
