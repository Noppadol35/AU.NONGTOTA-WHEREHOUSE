"use client";

import { FileText, User, Phone, Building, Calendar, Car, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface JobOrder {
  id: number;
  jobNumber: string;
  customerName: string;
  phoneNumber: string;
  carType: string;
  licensePlate: string;
  issueDetail?: string;
  jobDetail?: string;
  status: string;
  createdAt: string;
  branchId: number;
  branch: {
    name: string;
  };
}

interface JobOrderDetailsProps {
  jobOrder: JobOrder;
}

export default function JobOrderDetails({ jobOrder }: JobOrderDetailsProps) {
  const infoItems = [
    { icon: User, label: "ลูกค้า", value: jobOrder.customerName, color: "bg-blue-100 text-blue-600" },
    { icon: Phone, label: "เบอร์โทร", value: jobOrder.phoneNumber, color: "bg-green-100 text-green-600" },
    { icon: FileText, label: "เลขที่งาน", value: jobOrder.jobNumber, color: "bg-orange-100 text-orange-600" },
    { icon: Building, label: "สาขา", value: jobOrder.branch?.name || "ไม่ระบุ", color: "bg-indigo-100 text-indigo-600" },
    { icon: Calendar, label: "วันที่สร้าง", value: new Date(jobOrder.createdAt).toLocaleDateString("th-TH"), color: "bg-pink-100 text-pink-600" },
    { icon: Car, label: "ประเภทรถ", value: jobOrder.carType, color: "bg-purple-100 text-purple-600" },
  ];

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="pb-4 border-b border-gray-100/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-lg">รายละเอียดงาน</CardTitle>
            <CardDescription>ข้อมูลลูกค้าและรายละเอียดงาน</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color.split(" ")[0]}`}>
                <item.icon className={`w-5 h-5 ${item.color.split(" ")[1]}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <p className="font-semibold text-gray-900 text-sm">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Job Details */}
        {(jobOrder.issueDetail || jobOrder.jobDetail) && (
          <>
            <Separator />
            <div className="space-y-4">
              {jobOrder.issueDetail && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">รายละเอียดปัญหา</p>
                  <p className="text-sm text-gray-900 bg-gray-50/80 rounded-xl p-4">{jobOrder.issueDetail}</p>
                </div>
              )}
              {jobOrder.jobDetail && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">รายละเอียดงาน</p>
                  <p className="text-sm text-gray-900 bg-gray-50/80 rounded-xl p-4">{jobOrder.jobDetail}</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
