import { User, Phone, Car, Hash, ArrowRight } from "lucide-react";

interface JobOrder {
  id: number;
  jobNumber: string;
  customerName: string;
  phoneNumber: string;
  carType: string;
  licensePlate: string;
  status: string;
  createdAt: string;
  issueDetail?: string;
  jobDetail?: string;
  branchId?: number;
  branch?: {
    name: string;
  };
  items?: Array<{
    id: number;
    qty: number;
    product: {
      id: number;
      name: string;
      sku: string;
    };
  }>;
  // ข้อมูลการเงิน
  subtotal?: number;        // ยอดรวมสินค้า
  laborCost?: number;       // ค่าแรง
  vatAmount?: number;       // ภาษีมูลค่าเพิ่ม
  grandTotal?: number;      // ยอดรวมทั้งหมด
}

interface JobCardProps {
  job: JobOrder;
  onCardClick: (job: JobOrder) => void;
}

export default function JobCard({ job, onCardClick }: JobCardProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
      case "OPEN":
        return {
          label: "เปิดงาน",
          color: "bg-orange-100 text-orange-800 border-orange-200",
          bgColor: "bg-orange-50",
        };
      case "IN_PROGRESS":
        return {
          label: "กำลังดำเนินการ",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          bgColor: "bg-blue-50",
        };
      case "COMPLETED":
        return {
          label: "เสร็จสิ้น",
          color: "bg-green-100 text-green-800 border-green-200",
          bgColor: "bg-green-50",
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          bgColor: "bg-gray-50",
        };
    }
  };

  const statusInfo = getStatusInfo(job.status);

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-gray-300"
      onClick={() => onCardClick(job)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            #{job.jobNumber}
          </h3>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
          >
            {statusInfo.label}
          </div>
        </div>
        <div className="text-xs text-gray-500 text-right ml-2">
          {new Date(job.createdAt).toLocaleDateString("th-TH", {
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{job.customerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{job.phoneNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{job.carType}</span>
        </div>
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{job.licensePlate}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">คลิกเพื่อดูรายละเอียด</span>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <ArrowRight className="w-4 h-4" />
          </svg>
        </div>
        
        {/* Financial Information */}
        {job.grandTotal && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">ยอดรวม:</span>
              <span className="text-sm font-bold text-green-600">
                ฿{job.grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
