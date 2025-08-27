"use client";

import { FileText, User, Phone, Building, Calendar } from "lucide-react";

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
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-orange-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          รายละเอียดงาน
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">ลูกค้า</p>
              <p className="font-medium text-gray-900">
                {jobOrder.customerName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">เบอร์โทร</p>
              <p className="font-medium text-gray-900">
                {jobOrder.phoneNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">เลขที่งาน</p>
              <p className="font-medium text-gray-900">
                {jobOrder.jobNumber}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">สาขา</p>
              <p className="font-medium text-gray-900">
                {jobOrder.branch?.name || "ไม่ระบุ"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">วันที่สร้าง</p>
              <p className="font-medium text-gray-900">
                {new Date(jobOrder.createdAt).toLocaleDateString("th-TH")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">ประเภทรถ</p>
              <p className="font-medium text-gray-900">
                {jobOrder.carType}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-gray-500 mb-2">รายละเอียดงาน</p>
        <div className="space-y-3">
          {jobOrder.issueDetail && (
            <div>
              <p className="text-sm text-gray-500 mb-1">
                รายละเอียดปัญหา:
              </p>
              <p className="text-gray-900 bg-gray-50 rounded-lg p-3">
                {jobOrder.issueDetail}
              </p>
            </div>
          )}
          {jobOrder.jobDetail && (
            <div>
              <p className="text-sm text-gray-500 mb-1">
                รายละเอียดงาน:
              </p>
              <p className="text-gray-900 bg-gray-50 rounded-lg p-3">
                {jobOrder.jobDetail}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
