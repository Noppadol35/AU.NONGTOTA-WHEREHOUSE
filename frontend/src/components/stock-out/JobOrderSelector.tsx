"use client";
import { useState } from "react";
import { Clipboard, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Props = {
  selectedJobId: number | null;
  onJobSelect: (jobId: number | null) => void;
};

export default function JobOrderSelector({ selectedJobId, onJobSelect }: Props) {
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");

  const { data: jobOrdersData, isLoading } = trpc.jobOrders.list.useQuery({});
  const { data: consumersData } = trpc.jobOrders.consumers.useQuery();

  const jobOrders = jobOrdersData ?? [];
  const customers = consumersData?.consumers ?? [];

  const filteredJobOrders = jobOrders.filter(
    (job) => !selectedCustomer || job.customerName === selectedCustomer
  );

  const activeJobs = filteredJobOrders.filter(
    (job) => job.status === "OPEN" || job.status === "IN_PROGRESS"
  );

  return (
    <Card className="border-none shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />
      <CardHeader className="pb-4 border-b border-gray-100/50 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clipboard className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg">เลือกงานที่ต้องการเบิกสินค้า</CardTitle>
              <CardDescription>กรุณาเลือกงานที่ต้องการเบิกสินค้าจากคลัง</CardDescription>
            </div>
          </div>
          {!isLoading && activeJobs.length > 0 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">
              {activeJobs.length} งาน
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Customer Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">กรองตามลูกค้า</label>
          <Select value={selectedCustomer} onValueChange={(val) => setSelectedCustomer(val === "__all__" ? "" : val)}>
            <SelectTrigger className="w-full h-12 bg-white">
              <SelectValue placeholder="ทุกลูกค้า" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">ทุกลูกค้า</SelectItem>
              {customers.map((customer, index) => (
                <SelectItem key={`customer-${index}-${customer}`} value={customer}>
                  {customer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Job Order Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">เลือกงาน</label>
          <Select
            value={selectedJobId ? String(selectedJobId) : ""}
            onValueChange={(val) => onJobSelect(val ? parseInt(val) : null)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full h-12 bg-white">
              <SelectValue placeholder="-- เลือกงาน --" />
            </SelectTrigger>
            <SelectContent>
              {activeJobs.map((job) => (
                <SelectItem key={job.id} value={String(job.id)}>
                  Job #{job.jobNumber} — {job.customerName} ({job.carType})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            กำลังโหลดข้อมูล...
          </div>
        )}

        {/* Empty State */}
        {!isLoading && activeJobs.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clipboard className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">ไม่พบงานที่สามารถเบิกสินค้าได้</p>
            <p className="text-gray-400 text-xs mt-1">ตรวจสอบสถานะงานหรือตัวกรองลูกค้า</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
